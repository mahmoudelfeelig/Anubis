import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DEFAULT_UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? '/app/uploads'
  : path.join(process.cwd(), '.data', 'uploads');

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR);
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

const allowedTypes = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
]);

interface AvatarPayload {
  name: string;
  data: Buffer;
  type: string;
}

function cleanPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'avatar';
}

function ensureSafeKey(key: string) {
  const parts = key.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || part.includes('\\'))) {
    throw new Error('bad key');
  }
  return parts;
}

export function uploadPathForKey(key: string) {
  const parts = ensureSafeKey(key);
  const full = path.resolve(UPLOAD_ROOT, ...parts);
  const relative = path.relative(UPLOAD_ROOT, full);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('bad key');
  }
  return full;
}

export function avatarUrl(key: string) {
  if (!key) return '';
  return `/uploads/${ensureSafeKey(key).map(encodeURIComponent).join('/')}`;
}

export async function readUpload(key: string) {
  const full = uploadPathForKey(key);
  const data = await fs.readFile(full);
  const ext = path.extname(full).toLowerCase();
  const type = [...allowedTypes.entries()].find(([, allowedExt]) => allowedExt === ext)?.[0] ?? 'application/octet-stream';
  return { data, type };
}

export async function saveUserAvatar(userId: string, file: AvatarPayload) {
  if (!file?.name) throw new Error('no file');
  if (file.data.length > MAX_AVATAR_BYTES) throw new Error('too big');

  const type = file.type || 'application/octet-stream';
  const expectedExt = allowedTypes.get(type);
  if (!expectedExt) throw new Error('bad type');

  const base = cleanPart(file.name.replace(/\.[^.]+$/, ''));
  const safeUser = cleanPart(userId);
  const key = `avatars/${safeUser}/${Date.now()}-${randomUUID()}-${base}${expectedExt}`;
  const full = uploadPathForKey(key);

  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, file.data, { flag: 'wx' });
  return key;
}

export async function destroyAsset(key: string) {
  if (!key) return;
  try {
    await fs.unlink(uploadPathForKey(key));
  } catch {
    // Best-effort cleanup. Missing old avatars should not block profile updates.
  }
}
