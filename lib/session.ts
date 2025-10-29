import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';
import type { SessionDoc, UserDoc } from './types';

const COOKIE = 'sid';
const SECRET = process.env.SESSION_SECRET!;
if (!SECRET) throw new Error('SESSION_SECRET missing');

function sha256(b: Buffer | string) {
  return crypto.createHash('sha256').update(b).digest('hex');
}

export async function createSession(userId: string) {
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 1000*60*60*24*30);
  await sessions.insertOne({ tokenHash, userId, expiresAt });
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: true, expires: expiresAt, path: '/' });
}

export async function destroySession() {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  await sessions.deleteOne({ tokenHash: sha256(c) });
  cookies().set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: true, expires: new Date(0), path: '/' });
}

export async function getSessionUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  const s = await sessions.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  if (!s) return null;
  const users = db.collection<UserDoc>('users');
  const user = await users.findOne({ _id: s.userId });
  return user ? { id: user._id, username: user.username } : null;
}
