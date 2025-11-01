import { cache } from 'react';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { LevelConfig } from './types';

type Maps = {
  bySlug: Map<string, LevelConfig>;
  index: Map<string, number>;
  nextByNumber: Map<number, string>;
};

async function loadLevels(): Promise<Maps> {
  const root = path.join(process.cwd(), 'levels');
  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  const levels: LevelConfig[] = [];
  for (const dir of dirs) {
    const fp = path.join(root, dir.name, 'level.json');
    try {
      const raw = await fs.readFile(fp, 'utf8');
      const cfg = JSON.parse(raw) as LevelConfig;
      levels.push(cfg);
    } catch {
      // ignore directories without level.json
    }
  }
  levels.sort((a, b) => a.number - b.number);

  const bySlug = new Map<string, LevelConfig>();
  const index = new Map<string, number>();
  const nextByNumber = new Map<number, string>();
  for (let i = 0; i < levels.length; i += 1) {
    const level = levels[i]!;
    bySlug.set(level.slug, level);
    index.set(level.slug, level.number);
    const next = levels[i + 1];
    if (next) nextByNumber.set(level.number, next.slug);
  }
  return { bySlug, index, nextByNumber };
}

const getMaps = cache(loadLevels);

export const getLevel = cache(async (slug: string): Promise<LevelConfig> => {
  const { bySlug } = await getMaps();
  const level = bySlug.get(slug);
  if (!level) {
    const error = new Error(`Level ${slug} not found`);
    (error as { code?: string }).code = 'ENOENT';
    throw error;
  }
  return JSON.parse(JSON.stringify(level)) as LevelConfig;
});

export const getIndex = cache(async (): Promise<Record<string, number>> => {
  const { index } = await getMaps();
  return Object.fromEntries(index.entries());
});

export const getNextSlug = cache(async (number: number): Promise<string | null> => {
  const { nextByNumber } = await getMaps();
  return nextByNumber.get(number) ?? null;
});
