'use server';

import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { verifyPwd, hashPwd } from '@/lib/auth';
import { getSessionUser, destroySession } from '@/lib/session';
import { destroyAsset, saveUserAvatar } from '@/lib/storage';
import { toUserId } from '@/lib/mongo-ids';
import type { UserDoc } from '@/lib/models';

export async function updatePfp(form: FormData) {
  const me = await getSessionUser();
  if (!me) return;
  const userId = String(form.get('userId') ?? '');
  if (!userId || me.id !== userId) return;

  const db = await getDb();
  const users = db.collection<UserDoc>('users');

  try {
    const file = form.get('pfp') as File | null;
    if (!file || typeof file === 'string' || file.size === 0) {
      throw new Error('no file');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadName = file.name || `avatar-${Date.now()}`;

    const current = await users.findOne({ _id: toUserId(userId) }, { projection: { pfp: 1 } });
    const prevPublicId = current?.pfp || '';

    const newPublicId = await saveUserAvatar(userId, {
      name: uploadName,
      data: buffer,
      type: file.type || 'application/octet-stream',
    });

    await users.updateOne({ _id: toUserId(userId) }, { $set: { pfp: newPublicId } });

    if (prevPublicId && prevPublicId !== newPublicId) {
      await destroyAsset(prevPublicId);
    }
  } catch (error) {
    const msg = (error as Error)?.message || 'unknown';
    const name = (error as Error)?.name || 'Error';
    const code = (error as { http_code?: string }).http_code || '';
    console.error('avatar upload failed:', code, name, msg);
    return redirect(`/u/${me.username}?err=pfp`);
  }

  redirect(`/u/${me.username}?ok=pfp`);
}

export async function changePassword(form: FormData) {
  const me = await getSessionUser();
  if (!me) return;
  const userId = String(form.get('userId') ?? '');
  if (!userId || me.id !== userId) return;

  const old = String(form.get('old') ?? '');
  const nw = String(form.get('nw') ?? '');
  if (nw.length < 6) return;

  const db = await getDb();
  const users = db.collection<UserDoc>('users');
  const u = await users.findOne({ _id: toUserId(userId) }, { projection: { pwdHash: 1 } });
  if (!u) return;

  const ok = await verifyPwd(old, u.pwdHash);
  if (!ok) return;

  const hash = await hashPwd(nw);
  await users.updateOne({ _id: toUserId(userId) }, { $set: { pwdHash: hash } });

  redirect(`/u/${me.username}?ok=pw`);
}

export async function logout() {
  await destroySession();
  redirect('/');
}
