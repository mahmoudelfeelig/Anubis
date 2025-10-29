import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { getIndex, getLevel } from '@/lib/levels';

export default async function Page() {
  const user = await getSessionUser();
  const index = await getIndex();
  const total = Object.keys(index).length;

  let c = 0, nextSlug: string | null = null, nextTitle: string | null = null;
  if (user) {
    const db = await getDb();
    c = await db.collection('user_levels').countDocuments({ userId: user.id });
    const inv = Object.entries(index).reduce<Record<number,string>>((a,[s,n]) => (a[n]=s, a), {});
    nextSlug = inv[c+1] ?? null;
    nextTitle = nextSlug ? (await getLevel(nextSlug)).title : null;
  }

  return (
    <div className="grid cols-2">
      <section className="panel">
        <h1>Anubis</h1>
        <p>Inspect. Decode. Advance.</p>
        {!user && (
          <div style={{display:'flex',gap:10,marginTop:10}}>
            <Link href="/signup" className="btn primary">Create account</Link>
            <Link href="/login" className="btn">Log in</Link>
          </div>
        )}
        {user && (
          <div style={{display:'flex',gap:10,marginTop:10,flexWrap:'wrap'}}>
            {nextSlug && <Link className="btn accent" href={`/level/${nextSlug}`}>Continue → {nextTitle}</Link>}
            <Link className="btn" href="/levels">Your levels</Link>
            <Link className="btn" href={`/u/${user.username}`}>Your profile</Link>
          </div>
        )}
        <div style={{marginTop:14}}>
          <small>Levels cleared: <b>{c}</b> / {total}</small>
          <div className="progress" style={{marginTop:8}}><i style={{width:`${Math.round((c/Math.max(1,total))*100)}%`}} /></div>
        </div>
      </section>

      <section className="panel">
        <h2>How it works</h2>
        <ul>
          <li>Two solve modes: form creds or URL discovery.</li>
          <li>Hints live in page source and console.</li>
          <li>Sequential gating. Deep links don’t skip.</li>
        </ul>
        <p><small>Tip: open <span className="kbd">DevTools</span> and edit image <span className="kbd">src</span>.</small></p>
      </section>
    </div>
  );
}
