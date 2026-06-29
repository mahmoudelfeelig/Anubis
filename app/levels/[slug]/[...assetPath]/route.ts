export const runtime = "nodejs";

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function isSafeSegment(segment: string) {
  return segment !== "" && segment !== "." && segment !== ".." && !segment.includes("\\");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; assetPath: string[] }> },
) {
  const { slug, assetPath } = await params;
  if (!/^lv-\d{3}$/.test(slug) || !assetPath.every(isSafeSegment)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const requested = path.join(process.cwd(), "levels", slug, ...assetPath);
  const assetsRoot = path.join(process.cwd(), "levels", slug, "assets");
  const relative = path.relative(assetsRoot, requested);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const data = await fs.readFile(requested);
    const type = MIME[path.extname(requested).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
