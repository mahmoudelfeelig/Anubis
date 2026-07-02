export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPwd } from '@/lib/auth';
import { isValidUsername, normalizeUsernameInput, readPasswordInput } from '@/lib/auth-input';
import { createSession } from '@/lib/session';
import type { UserDoc } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const username = normalizeUsernameInput(fd.get('username'));
    const password = readPasswordInput(fd.get('password'));

    if (!isValidUsername(username) || !password) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const db = await getDb();
    const users = db.collection<UserDoc>('users');
    const user = await users.findOne({ username });
    if (!user) return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });

    const ok = await verifyPwd(password, user.pwdHash);
    if (!ok) return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });

    await createSession(user._id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Login failed', error);
    return NextResponse.json({ error: 'Login is unavailable right now.' }, { status: 500 });
  }
}
