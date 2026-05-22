export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { readUpload } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;

  try {
    const { data, type } = await readUpload(key.join('/'));
    return new NextResponse(data, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
