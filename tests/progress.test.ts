import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const controls = {
  updateOne: vi.fn(),
  find: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(async () => ({
    collection: (name: string) => {
      if (name !== 'user_levels') {
        throw new Error(`Unexpected collection requested: ${name}`);
      }
      return {
        updateOne: (...args: unknown[]) => controls.updateOne(...args),
        find: (...args: unknown[]) => controls.find(...args),
      };
    },
  })),
}));

let progress: typeof import('@/lib/progress');

beforeAll(async () => {
  progress = await import('@/lib/progress');
});

beforeEach(() => {
  controls.updateOne = vi.fn();
  const toArray = vi.fn().mockResolvedValue([]);
  controls.find = vi.fn(() => ({ toArray }));
});

describe('markCleared', () => {
  it('upserts a single user/slug pair with timestamp', async () => {
    await progress.markCleared('user-1', 'lv-001');

    expect(controls.updateOne).toHaveBeenCalledTimes(1);
    const [filter, update, options] = controls.updateOne.mock.calls[0];
    expect(filter).toEqual({ userId: 'user-1', slug: 'lv-001' });
    expect(update).toEqual({
      $setOnInsert: expect.objectContaining({ userId: 'user-1', slug: 'lv-001' }),
    });
    expect(update.$setOnInsert.clearedAt).toBeInstanceOf(Date);
    expect(options).toEqual({ upsert: true });
  });
});

describe('getHighestCleared', () => {
  it('returns the highest cleared level number for the user', async () => {
    const rows = [
      { slug: 'lv-001' },
      { slug: 'lv-005' },
      { slug: 'unknown' },
    ];
    const toArray = vi.fn().mockResolvedValue(rows);
    controls.find = vi.fn(() => ({ toArray }));

    const index = { 'lv-001': 1, 'lv-005': 5 };
    const result = await progress.getHighestCleared('user-1', index);

    expect(controls.find).toHaveBeenCalledWith(
      { userId: 'user-1' },
      { projection: { slug: 1 } },
    );
    expect(result).toBe(5);
  });

  it('returns 0 when user has no cleared levels', async () => {
    const toArray = vi.fn().mockResolvedValue([]);
    controls.find = vi.fn(() => ({ toArray }));
    const result = await progress.getHighestCleared('user-1', {});
    expect(result).toBe(0);
  });
});
