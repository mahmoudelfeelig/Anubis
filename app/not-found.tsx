import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { getIndex, getLevel } from '@/lib/levels';

export default async function NotFound() {
  const user = await getSessionUser();
  let latestSlug: string | null = null;
  let latestTitle: string | null = null;

  if (user) {
    const db = await getDb();
    const last = await db.collection('user_levels')
      .find({ userId: user.id })
      .project<{ slug:string, clearedAt:Date }>({ slug:1, clearedAt:1 })
      .sort({ clearedAt:-1 }).limit(1).toArray();
    if (last[0]) {
      latestSlug = last[0].slug;
      latestTitle = (await getLevel(latestSlug)).title;
    }
  }

  return (
    <section className="panel" style={{
      position:'relative', overflow:'hidden',
      background:'#0c1016',
      border:'1px solid var(--line)',
    }}>
      <div style={{
        position:'absolute', inset:-20, pointerEvents:'none',
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 2px, transparent 2px 4px)'
      }} />
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:
          'radial-gradient(800px 400px at 30% 10%, rgba(176,20,47,.08), transparent 60%),' +
          'radial-gradient(600px 300px at 80% 90%, rgba(176,20,47,.05), transparent 60%)',
        mixBlendMode:'overlay'
      }} />

      <div style={{display:'flex', gap:16, alignItems:'center'}}>
        <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#b0142f" d="M5 21l5-3 1-5-5-5 2-2 5 4 3-1 3-5 2 1-1 6-3 4 1 5-4 1-4 2z"/>
        </svg>
        <h1 style={{margin:0}}>404 — Not Found</h1>
      </div>

      <p style={{marginTop:10, color:'var(--muted)'}}>
        The jackal stares. The path you took isn’t mapped.
        <br/>Check the URL, or choose a safe trail below.
      </p>

      <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:12}}>
        <Link href="/" className="btn">← Home</Link>
        <Link href="/leaderboard" className="btn">Leaderboard</Link>
        <Link href="/hints" className="btn">Hints</Link>
        {user && <Link href="/levels" className="btn">Your levels</Link>}
        {user && latestSlug && (
          <Link href={`/level/${latestSlug}`} className="btn accent">↺ {latestTitle}</Link>
        )}
      </div>

      <div style={{marginTop:18}}>
        <small className="badge">ERR_PATH_MISSING</small>
      </div>
    </section>
  );
}
