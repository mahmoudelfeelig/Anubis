import { getDb } from './db';
import { getIndex, getLevel } from './levels';
import type { UserLevelDoc } from './types';

export type ProgressSummary = {
  total: number;
  cleared: number;
  nextSlug: string | null;
  nextTitle: string | null;
  nextNumber: number | null;
  percentage: number;
  clearedSlugs: string[];
};

export async function markCleared(userId: string, slug: string) {
  const db = await getDb();
  const userLevels = db.collection<UserLevelDoc>('user_levels');
  await userLevels.updateOne(
    { userId, slug },
    { $setOnInsert: { userId, slug, clearedAt: new Date() } },
    { upsert: true }
  );
}

export async function getHighestCleared(userId: string, index: Record<string, number>) {
  const db = await getDb();
  const userLevels = db.collection<UserLevelDoc>('user_levels');
  const rows = await userLevels.find(
    { userId },
    { projection: { slug: 1 } }
  ).toArray();
  const nums = rows
    .map(r => index[r.slug])
    .filter((n): n is number => typeof n === 'number');
  return nums.length ? Math.max(...nums) : 0;
}

export async function getUserProgressSummary(
  userId: string,
  providedIndex?: Record<string, number>,
): Promise<ProgressSummary> {
  const db = await getDb();
  const index = providedIndex ?? (await getIndex());
  const total = Object.keys(index).length;

  const rows = await db
    .collection<UserLevelDoc>('user_levels')
    .find({ userId })
    .project<{ slug: string }>({ slug: 1 })
    .toArray();

  const clearedSlugs = rows.map((row) => row.slug);
  const clearedNumbers = new Set(
    clearedSlugs
      .map((slug) => index[slug])
      .filter((num): num is number => typeof num === 'number'),
  );

  let nextNumber: number | null = null;
  for (let i = 1; i <= total; i++) {
    if (!clearedNumbers.has(i)) {
      nextNumber = i;
      break;
    }
  }

  let nextSlug: string | null = null;
  let nextTitle: string | null = null;
  if (nextNumber !== null) {
    const entry = Object.entries(index).find(([, num]) => num === nextNumber);
    if (entry) {
      nextSlug = entry[0];
      nextTitle = (await getLevel(entry[0])).title;
    }
  }

  const percentage = total === 0 ? 0 : Math.round((clearedNumbers.size / total) * 100);

  return {
    total,
    cleared: clearedNumbers.size,
    nextSlug,
    nextTitle,
    nextNumber,
    percentage,
    clearedSlugs,
  };
}
