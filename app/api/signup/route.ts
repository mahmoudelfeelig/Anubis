export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPwd } from '@/lib/auth';
import { normalizeUsernameInput, readPasswordInput, USERNAME_PATTERN } from '@/lib/auth-input';
import { createSession } from '@/lib/session';
import type { UserDoc } from '@/lib/types';
import { z } from 'zod';

const schema = z.object({
  username: z.string().regex(USERNAME_PATTERN),
  password: z.string().min(6).max(64),
});

function isDuplicateKey(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false;
  return (error as { code?: unknown }).code === 11000;
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const username = normalizeUsernameInput(fd.get('username'));
    const password = readPasswordInput(fd.get('password'));
    const parsed = schema.safeParse({ username, password });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Use 3-24 lowercase letters, numbers, underscores, or hyphens. Passwords need 6-64 characters.' },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection<UserDoc>('users');
    const exists = await users.findOne({ username });
    if (exists) return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });

    const _id = crypto.randomUUID();
    const pwdHash = await hashPwd(password);
    await users.insertOne({ _id, username, pwdHash, createdAt: new Date() });
    await createSession(_id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDuplicateKey(error)) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    console.error('Signup failed', error);
    return NextResponse.json({ error: 'Signup is unavailable right now.' }, { status: 500 });
  }
}
