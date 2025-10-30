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
  it('returns a mapping that includes all known slugs', () => {
    expect(index).toHaveProperty('lv-001', 1);
    expect(index).toHaveProperty('lv-025');
    expect(Object.keys(index).length).toBeGreaterThanOrEqual(25);
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

