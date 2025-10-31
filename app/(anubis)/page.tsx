export const runtime = 'nodejs';

import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { getIndex, getLevel } from '@/lib/levels';
import { getUserProgressSummary } from '@/lib/progress';

const featureSignals = [
  {
    title: 'Signal scrubbing',
    body: 'Each level hides corrupted prompts, console artifacts, and tampered media assets. Reconstruct the payload before the static settles.',
  },
  {
    title: 'Sequential locks',
    body: 'Progression is linear. Break one seal to expose the next—no skips, no spoilers, no shortcuts.',
  },
  {
    title: 'Shared intelligence',
    body: 'Leaderboard pulses update by the minute so every operative can watch fresh clears cascade across the grid.',
  },
];

export default async function Page() {
  const user = await getSessionUser();
  const index = await getIndex();
  const progress = user ? await getUserProgressSummary(user.id, index) : null;

  let nextSlug: string | null = null;
  let nextTitle: string | null = null;
  if (progress?.nextSlug) {
    nextSlug = progress.nextSlug;
    nextTitle = progress.nextTitle ?? (await getLevel(progress.nextSlug)).title;
  }

  return (
    <div className="home-grid">
      <section className="panel hero-panel">
        <div className="hero-copy">
          <h1 data-echo="Anubis protocol">Anubis protocol</h1>
          <p>
            Inspect corrupted transmissions, decode embedded credentials, and advance through the necropolis of
            terminals. Each solved anomaly unlocks the next ritual in the stack.
          </p>
          {!user ? (
            <div className="hero-actions">
              <Link href="/signup" className="btn primary" data-echo="Create account">
                Create account
              </Link>
              <Link href="/login" className="btn" data-echo="Log in">
                Log in
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              {nextSlug && (
                <Link className="btn accent" href={`/level/${nextSlug}`} data-echo="Continue">
                  Resume {nextTitle}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="panel intel-panel">
        <h2 data-echo="Operational brief">Operational brief</h2>
        <div className="intel-cards">
          {featureSignals.map(({ title, body }) => (
            <article key={title} className="intel-card">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="intel-note">
          <small>
            Tip: open <span className="kbd">DevTools</span>, scrub <span className="kbd">Network</span>, and watch for
            unguarded redirects. Assets whisper as loud as prompts.
          </small>
        </p>
      </section>

      <section className="panel feed-panel">
        <h2 data-echo="System status">System status</h2>
        <div className="feed-grid">
          <div className="feed-callout">
            <h3>Activity pulses</h3>
            <p>
              Leaderboards refresh every minute so your handle flares the moment you clear an anomaly. Sort, search, and
              chase every operative in real-time.
            </p>
            <Link className="btn" href="/leaderboard" data-echo="Leaderboard">
              Check the leaderboard
            </Link>
          </div>
          <div className="feed-callout">
            <h3>Recovered dossiers</h3>
            <p>
              Every solved ritual archives its media, hints, and credentials. Revisit past signals, replay them with
              friends, or audit your deduction trail.
            </p>
            <Link className="btn" href="/levels" data-echo="Recovered dossiers">
              Revisit your clears
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
