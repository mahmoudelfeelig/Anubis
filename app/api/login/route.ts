import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPwd } from '@/lib/auth';
import { createSession } from '@/lib/session';
import type { UserDoc } from '@/lib/types';

export async function POST(req: Request) {
  const fd = await req.formData();
  const username = String(fd.get('username')||'').toLowerCase();
  const password = String(fd.get('password')||'');
  const db = await getDb();
  const users = db.collection<UserDoc>('users');
  const user = await users.findOne({ username });
  if (!user) return new NextResponse('invalid', { status: 401 });
  const ok = await verifyPwd(password, user.pwdHash);
  if (!ok) return new NextResponse('invalid', { status: 401 });
  await createSession(user._id);
  return NextResponse.json({ ok: true });
}
