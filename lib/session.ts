import { cookies } from 'next/headers';
import { getDb } from './db';
import type { SessionDoc, UserDoc } from './types';

const COOKIE = 'sid';

const encoder = new TextEncoder();

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET missing');
  return secret;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256(input: Uint8Array | string): Promise<string> {
  const data = typeof input === 'string' ? encoder.encode(input) : input;
  const source =
    data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
      ? (data.buffer as ArrayBuffer)
      : (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
  const digest = await crypto.subtle.digest('SHA-256', source);
  return toHex(new Uint8Array(digest));
}

async function hashSessionToken(token: string) {
  return sha256(`${sessionSecret()}:${token}`);
}

function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return toHex(array);
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  };
}

export async function createSession(userId: string) {
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  const token = randomHex(32);
  const tokenHash = await hashSessionToken(token);
  const expiresAt = new Date(Date.now() + 1000*60*60*24*30);
  await sessions.insertOne({ tokenHash, userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, cookieOptions(expiresAt));
}

export async function destroySession() {
  const cookieStore = await cookies();
  const c = cookieStore.get(COOKIE)?.value;
  if (!c) return;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  const tokenHash = await hashSessionToken(c);
  await sessions.deleteOne({ tokenHash });
  cookieStore.set(COOKIE, '', cookieOptions(new Date(0)));
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>('sessions');
  const tokenHash = await hashSessionToken(token);
  const s = await sessions.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!s) return null;
  const users = db.collection<UserDoc>('users');
  const user = await users.findOne({ _id: s.userId });
  return user ? { id: user._id, username: user.username } : null;
}
