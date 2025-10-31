export const runtime = 'nodejs';
export const revalidate = 60;

import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getLevel } from '@/lib/levels';
import type { UserDoc, UserLevelDoc } from '@/lib/types';
import LeaderboardTable, { LeaderboardRow } from '@/components/LeaderboardTable';

const PAGE_SIZE = 10;

type PageParams = {
  searchParams: {
    pg?: string;
  };
};

export default async function Page({ searchParams }: PageParams) {
  const params = await searchParams;
  const pg = Math.max(1, Number.parseInt(params?.pg || '1', 10) || 1);
  const db = await getDb();
  const userLevels = db.collection<UserLevelDoc>('user_levels');
  const usersCol = db.collection<UserDoc>('users');

  const pipeline = [
    { $group: { _id: '$userId', clears: { $sum: 1 }, last: { $max: '$clearedAt' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
    { $unwind: '$u' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$u.username',
        pfp: '$u.pfp',
        clears: 1,
        last: 1,
      },
    },
    { $sort: { clears: -1, last: -1 } },
    { $skip: (pg - 1) * PAGE_SIZE },
    { $limit: PAGE_SIZE },
  ];

  const top = await userLevels
    .aggregate<{ userId: string; username: string; clears: number; last: Date }>(pipeline)
    .toArray();

  const recent = await userLevels
    .find({})
    .project<{ userId: string; slug: string; clearedAt: Date }>({ userId: 1, slug: 1, clearedAt: 1 })
    .sort({ clearedAt: -1 })
    .limit(20)
    .toArray();

  const usersMap = new Map<string, string>();
  const userIds = Array.from(new Set(recent.map((r) => r.userId)));
  const users = await usersCol
    .find({ _id: { $in: userIds } })
    .project<{ _id: string; username: string }>({ _id: 1, username: 1 })
    .toArray();
  users.forEach((u) => usersMap.set(u._id, u.username));

  const recentRows = await Promise.all(
    recent.map(async (record) => {
      const level = await getLevel(record.slug);
      return {
        username: usersMap.get(record.userId) || 'user',
        slug: record.slug,
        title: level.title,
        when: record.clearedAt,
      };
    }),
  );

  const topRows: LeaderboardRow[] = top.map((row, index) => ({
    rank: (pg - 1) * PAGE_SIZE + index + 1,
    username: row.username,
    clears: row.clears,
    lastIso: row.last?.toISOString?.() ?? '',
  }));

  return (
    <div className="grid cols-2">
      <section className="panel leaderboard-panel">
        <h1 data-echo="Leaderboard">Leaderboard</h1>
        <LeaderboardTable rows={topRows} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {pg > 1 ? (
            <Link className="btn" href={`/leaderboard?pg=${pg - 1}`} data-echo="Previous">
              Previous page
            </Link>
          ) : (
            <span />
          )}
          {top.length === PAGE_SIZE && (
            <Link className="btn" href={`/leaderboard?pg=${pg + 1}`} data-echo="Next">
              Next page
            </Link>
          )}
        </div>
      </section>

      <section className="panel leaderboard-recent">
        <h2 data-echo="Latest solves">Latest solves</h2>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Level</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {recentRows.map((row, idx) => (
              <tr key={`${row.username}-${row.slug}-${idx}`}>
                <td>
                  <Link href={`/u/${row.username}`}>@{row.username}</Link>
                </td>
                <td>
                  <Link href={`/level/${row.slug}`}>{row.title}</Link>
                </td>
                <td>
                  <small>{row.when.toISOString()}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

