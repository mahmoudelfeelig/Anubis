import fs from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import type { LevelConfig } from './types';

const ROOT = path.join(process.cwd(), 'levels');

async function readLevel(slug: string): Promise<LevelConfig> {
  const filePath = path.join(ROOT, slug, 'level.json');
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readIndex(): Promise<Record<string, number>> {
  const dirs = await fs.readdir(ROOT);
  const entries = await Promise.all(
    dirs.map(async (dir) => {
      const config = await readLevel(dir);
      return [config.slug, config.number] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export const getLevel = cache(readLevel);

export const getIndex = cache(readIndex);

export const getNextSlug = cache(async (number: number): Promise<string | null> => {
  const index = await getIndex();
  const inverted = Object.entries(index).reduce<Record<number, string>>((acc, [slug, num]) => {
    acc[num] = slug;
    return acc;
  }, {});
  return inverted[number + 1] ?? null;
});

