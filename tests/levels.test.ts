import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import { getLevel, getIndex, getNextSlug } from '@/lib/levels';

let index: Record<string, number>;

beforeAll(async () => {
  index = await getIndex();
});

describe('getLevel', () => {
  it('loads level metadata for an existing slug', async () => {
    const level = await getLevel('lv-001');
    expect(level.slug).toBe('lv-001');
    expect(level.title).toBeDefined();
    expect(level.number).toBe(1);
    expect(level.mdx).toBe('prompt.mdx');
  });
});

describe('getIndex', () => {
  it('includes every level directory', async () => {
    const levelsPath = path.join(process.cwd(), 'levels');
    const slugs = (await fs.readdir(levelsPath)).filter((name) => name.startsWith('lv-'));

    expect(slugs.length).toBeGreaterThan(0);
    slugs.forEach((slug) => {
      expect(index).toHaveProperty(slug);
      expect(typeof index[slug]).toBe('number');
    });
  });
});

describe('getNextSlug', () => {
  it('returns the next slug when it exists', async () => {
    await expect(getNextSlug(1)).resolves.toBe('lv-002');
  });

  it('returns null when the number is the last one', async () => {
    const maxLevel = Math.max(...Object.values(index));
    await expect(getNextSlug(maxLevel)).resolves.toBeNull();
  });
});
