import { getDb } from './db';
import type { UserLevelDoc } from './types';

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
  const nums = rows.map(r => index[r.slug]).filter(Boolean);
  return nums.length ? Math.max(...nums) : 0;
}
