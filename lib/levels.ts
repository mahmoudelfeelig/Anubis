import fs from 'node:fs/promises';
import path from 'node:path';
import type { LevelConfig } from './types';

const ROOT = path.join(process.cwd(), 'levels');

let _cacheIdx: Record<string, number> | null = null;

export async function getLevel(slug: string): Promise<LevelConfig> {
  const p = path.join(ROOT, slug, 'level.json');
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

export async function getIndex(): Promise<Record<string, number>> {
  if (_cacheIdx) return _cacheIdx;
  const dirs = await fs.readdir(ROOT);
  const entries = await Promise.all(dirs.map(async d => {
    const cfg = JSON.parse(await fs.readFile(path.join(ROOT, d, 'level.json'), 'utf8')) as LevelConfig;
    return [cfg.slug, cfg.number] as const;
  }));
  _cacheIdx = Object.fromEntries(entries);
  return _cacheIdx;
}

export async function getNextSlug(number: number): Promise<string | null> {
  const idx = await getIndex();
  const inv = Object.entries(idx).reduce<Record<number,string>>((a,[s,n]) => (a[n]=s,a), {});
  return inv[number+1] ?? null;
}
