import path from 'node:path';

export * from './storage-cloudinary';

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

/** Resolve a relative path under /public, guarding against directory traversal. */
export function resolvePath(segments: string[]) {
  const candidate = path.join(PUBLIC_ROOT, ...segments);
  const normalized = path.normalize(candidate);
  if (!normalized.startsWith(PUBLIC_ROOT)) {
    throw new Error('Invalid path');
  }
  return normalized;
}
