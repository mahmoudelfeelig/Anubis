import fs from 'node:fs/promises';
import type { NextRequest } from 'next/server';
import mime from 'mime';
import { resolvePath } from '@/lib/storage';

export async function GET(_: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const abs = resolvePath(path);
    const data = await fs.readFile(abs);
    const type = mime.getType(abs) || 'application/octet-stream';
    return new Response(data, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
