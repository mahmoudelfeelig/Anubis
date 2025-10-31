export const runtime = 'nodejs';

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPwd } from '@/lib/auth';
import { createSession } from '@/lib/session';
import type { UserDoc } from '@/lib/types';
import { z } from 'zod';

export async function POST(req: Request) {
  const fd = await req.formData();
  const username = String(fd.get('username')||'').trim();
  const password = String(fd.get('password')||'');
  const schema = z.object({ username: z.string().min(3).max(24), password: z.string().min(6).max(64) });
  const p = schema.safeParse({ username, password });
  if (!p.success) return new NextResponse('invalid', { status: 400 });

  const db = await getDb();
  const users = db.collection<UserDoc>('users');
  const usernameLower = username.toLowerCase();
  const exists = await users.findOne({ username: usernameLower });
  if (exists) return new NextResponse('taken', { status: 409 });

  const _id = crypto.randomUUID();
  const pwdHash = await hashPwd(password);
  await users.insertOne({ _id, username: usernameLower, pwdHash, createdAt: new Date() });
  await createSession(_id);
  return NextResponse.json({ ok: true });
}
