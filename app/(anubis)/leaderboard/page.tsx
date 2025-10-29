import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getLevel } from '@/lib/levels';
import type { UserDoc, UserLevelDoc } from '@/lib/types';

const PAGE = 10;

export default async function Page({ searchParams }:{ searchParams:{ pg?:string } }) {
  const pg = Math.max(1, parseInt(searchParams.pg || '1', 10) || 1);
  const db = await getDb();
  const userLevels = db.collection<UserLevelDoc>('user_levels');
  const usersCol = db.collection<UserDoc>('users');

  const pipe = [
    { $group: { _id: '$userId', clears: { $sum: 1 }, last: { $max: '$clearedAt' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
    { $unwind: '$u' },
    { $project: { _id:0, userId:'$_id', username:'$u.username', pfp:'$u.pfp', clears:1, last:1 } },
    { $sort: { clears:-1, last:-1 } },
    { $skip: (pg-1)*PAGE },
    { $limit: PAGE }
  ];
  const top = await userLevels.aggregate<{userId:string,username:string,pfp?:string,clears:number,last:Date}>(pipe).toArray();

  const recent = await userLevels.find({})
    .project<{ userId:string, slug:string, clearedAt:Date }>({ userId:1, slug:1, clearedAt:1 })
    .sort({ clearedAt:-1 }).limit(20).toArray();

  // enrich recent with usernames and titles
  const usersMap = new Map<string,string>();
  const userIds = Array.from(new Set(recent.map(r=>r.userId)));
  const users = await usersCol.find({ _id: { $in: userIds } })
    .project<{_id:string,username:string}>({_id:1,username:1}).toArray();
  users.forEach(u=>usersMap.set(u._id, u.username));
  const recRows = await Promise.all(recent.map(async r=>{
    const t = (await getLevel(r.slug)).title;
    return { username: usersMap.get(r.userId) || 'user', slug:r.slug, title:t, when:r.clearedAt };
  }));

  return (
    <div className="grid cols-2">
      <section className="panel">
        <h1>Leaderboard</h1>
        <table className="table">
          <thead><tr><th>#</th><th>User</th><th>Clears</th><th>Last</th></tr></thead>
          <tbody>
            {top.map((r,i)=>(
              <tr key={r.userId}>
                <td>{(pg-1)*PAGE + i + 1}</td>
                <td><Link href={`/u/${r.username}`}>@{r.username}</Link></td>
                <td>{r.clears}</td>
                <td><small>{r.last?.toISOString?.() ?? ''}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          {pg>1 && <Link className="btn" href={`/leaderboard?pg=${pg-1}`}>← Prev</Link>}
          {top.length===PAGE && <Link className="btn" href={`/leaderboard?pg=${pg+1}`}>Next →</Link>}
        </div>
      </section>

      <section className="panel">
        <h2>Latest solves</h2>
        <table className="table">
          <thead><tr><th>User</th><th>Level</th><th>When</th></tr></thead>
          <tbody>
            {recRows.map((r,idx)=>(
              <tr key={idx}>
                <td><Link href={`/u/${r.username}`}>@{r.username}</Link></td>
                <td><Link href={`/level/${r.slug}`}>{r.title}</Link></td>
                <td><small>{r.when.toISOString()}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
