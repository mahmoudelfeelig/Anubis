export const runtime = 'nodejs';

import Link from 'next/link';
import { getSessionUser } from '@/lib/session';
import { getIndex, getLevel } from '@/lib/levels';
import { getUserProgressSummary } from '@/lib/progress';

const featureSignals = [
  {
    title: 'Recovered media',
    body: 'Every level is a damaged page, label, manifest, transcript, or recording. The answer is in how the evidence behaves.',
  },
  {
    title: 'Linear archive',
    body: 'Progression is locked to the tape order. Clear the current file before the archive releases the next one.',
  },
  {
    title: 'Quiet records',
    body: 'The scoreboard is only a record of clears. The site keeps the route out of view.',
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
          <h1 data-echo="Elfeel archive">Elfeel archive</h1>
          <p>
            A browser riddle built from recovered analog media. Read the page, question the file, and advance only when
            the evidence gives you two plain words.
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
        <h2 data-echo="Viewing notes">Viewing notes</h2>
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
            Not every clue is visible at first glance. Titles, source, attachments, rhythm, wording, and layout can all
            matter.
          </small>
        </p>
      </section>

      <section className="panel feed-panel">
        <h2 data-echo="Archive status">Archive status</h2>
        <div className="feed-grid">
          <div className="feed-callout">
            <h3>Clear log</h3>
            <p>
              The leaderboard tracks cleared files without exposing the route. Sort the record, then get back to the
              tape.
            </p>
            <Link className="btn" href="/leaderboard" data-echo="Leaderboard">
              Check the leaderboard
            </Link>
          </div>
          <div className="feed-callout">
            <h3>File shelf</h3>
            <p>
              Revisit unlocked files as evidence, not tutorials. The archive keeps the objects; the deductions stay
              yours.
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
