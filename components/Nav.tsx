import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { getIndex, getLevel } from '@/lib/levels';
import { getDb } from '@/lib/db';
import { logout } from '@/lib/user-actions'

async function getProgress(userId: string) {
  const db = await getDb();
  const index = await getIndex();
  const total = Object.keys(index).length;
  const cleared = await db.collection('user_levels').countDocuments({ userId });
  const last = await db.collection('user_levels').find({ userId })
    .project<{ slug:string, clearedAt:Date }>({ slug:1, clearedAt:1 })
    .sort({ clearedAt:-1 }).limit(1).toArray();
  let latestSlug: string | null = null, latestTitle: string | null = null;
  if (last[0]) {
    latestSlug = last[0].slug;
    latestTitle = (await getLevel(latestSlug)).title;
  }
  return { total, cleared, latestSlug, latestTitle };
}

export default async function Nav() {
  const user = await getSessionUser();
  const prog = user ? await getProgress(user.id) : null;
  const pct = prog ? Math.round((prog.cleared / Math.max(1, prog.total)) * 100) : 0;

  return (
    <nav className="nav" aria-label="Primary">
      <Link href="/" className="brand" title="Home">
        {/* Jackal head glyph */}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#b0142f" d="M5 21l5-3 1-5-5-5 2-2 5 4 3-1 3-5 2 1-1 6-3 4 1 5-4 1-4 2z"/>
        </svg>
        <b>Anubis</b>
      </Link>
      <Link href="/levels">Levels</Link>
      <Link href="/hints">Hints</Link>
      <Link href="/leaderboard">Leaderboard</Link>
      {user && <Link href={`/u/${user.username}`}>Profile</Link>}
      <div className="nav-spacer" />
      {user && (
        <>
          <small className="badge">{prog?.cleared ?? 0}/{prog?.total ?? 0}</small>
          <div style={{ width: 160 }} className="progress" aria-label="Progress">
            <i style={{ width: `${pct}%` }} />
          </div>
          {prog?.latestSlug && (
            <Link className="btn" href={`/level/${prog.latestSlug}`} title="Latest finished">
              ↺ {prog.latestTitle}
            </Link>
          )}
          <form action={logout}><button className="btn" style={{marginLeft:8}}>Log out</button></form>
        </>
      )}
      {!user && <Link className="btn" href="/login">Log in</Link>}
    </nav>
  );
}
