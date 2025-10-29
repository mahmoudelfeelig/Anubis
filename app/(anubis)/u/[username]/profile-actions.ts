'use server';

import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { verifyPwd, hashPwd } from '@/lib/auth';
import { getSessionUser } from '@/lib/session';
import { saveUserAvatarCloudinary, destroyAsset } from '@/lib/storage-cloudinary';
import { toUserId } from '@/lib/mongo-ids';
import type { UserDoc } from '@/lib/models';

export async function updatePfp(form: FormData) {
  const me = await getSessionUser(); if (!me) return;
  const userId = String(form.get('userId') ?? ''); if (!userId || me.id !== userId) return;

  const db = await getDb();
  const users = db.collection<UserDoc>('users');

  try {
    const file = form.get('pfp') as File | null;
    if (!file || typeof file === 'string' || file.size === 0) {
      throw new Error('no file');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadName = file.name || `avatar-${Date.now()}`;

    // read previous public_id (if any)
    const current = await users.findOne({ _id: toUserId(userId) }, { projection: { pfp: 1 } });
    const prevPublicId = current?.pfp || '';

    // upload new avatar under anubis/users/<userId>/
    const newPublicId = await saveUserAvatarCloudinary(userId, {
      name: uploadName,
      data: buffer,
      type: file.type || 'application/octet-stream',
    });

    // store the new public_id on the user
    await users.updateOne({ _id: toUserId(userId) }, { $set: { pfp: newPublicId } });

    // best-effort delete the previous one (keeps storage lean)
    if (prevPublicId && prevPublicId !== newPublicId) {
      await destroyAsset(prevPublicId);
    }
  } catch (e: any) {
    // log something useful if Cloudinary throws
    const msg = e?.message || 'unknown';
    const name = e?.name || 'Error';
    const code = e?.http_code || '';
    console.error('avatar upload failed:', code, name, msg);
    // redirect to error only here (don’t catch success redirect)
    return redirect(`/u/${me.username}?err=pfp`);
  }

  // success redirect (outside try/catch so it isn’t swallowed)
  redirect(`/u/${me.username}?ok=pfp`);
}

export async function changePassword(form: FormData) {
  const me = await getSessionUser(); if (!me) return;
  const userId = String(form.get('userId') ?? ''); if (!userId || me.id !== userId) return;

  const old = String(form.get('old') ?? '');
  const nw = String(form.get('nw') ?? '');
  if (nw.length < 6) return;

  const db = await getDb();
  const users = db.collection<UserDoc>('users');
  const u = await users.findOne({ _id: toUserId(userId) }, { projection: { pwdHash: 1 } });
  if (!u) return;

  const ok = await verifyPwd(old, u.pwdHash); if (!ok) return;

  const hash = await hashPwd(nw);
  await users.updateOne({ _id: toUserId(userId) }, { $set: { pwdHash: hash } });

  redirect(`/u/${me.username}?ok=pw`);
}
