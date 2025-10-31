export const runtime = 'nodejs';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { getIndex, getLevel } from '@/lib/levels';
import { getUserProgressSummary } from '@/lib/progress';

export default async function Page() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const db = await getDb();
  const index = await getIndex();
  const progress = await getUserProgressSummary(user.id, index);

  const rows = await db.collection('user_levels').find({ userId: user.id })
    .project<{ slug:string, clearedAt:Date }>({ slug:1, clearedAt:1 })
    .sort({ clearedAt:-1 }).toArray();

  const levels = await Promise.all(rows.map(async r => {
    const cfg = await getLevel(r.slug);
    return { slug:r.slug, title:cfg.title, num:cfg.number, when:r.clearedAt };
  }));

  const timeline = Object.entries(index)
    .sort(([, a], [, b]) => a - b)
    .map(([slug, num]) => ({
      slug,
      num,
      status: progress.clearedSlugs.includes(slug)
        ? 'cleared'
        : progress.nextSlug === slug
          ? 'next'
          : 'locked',
    }));

  const remaining = Math.max(progress.total - progress.cleared, 0);

  return (
    <div className="progress-page">
      <section className="panel progress-panel">
        <div className="progress-panel-header">
          <div>
            <h1 data-echo="Signal uplink">Signal uplink</h1>
            <small>{progress.cleared}/{progress.total} decrypted</small>
          </div>
          {progress.nextSlug && (
            <Link
              className="btn accent"
              href={`/level/${progress.nextSlug}`}
              data-echo="Resume Level"
            >
              Resume {progress.nextTitle ?? progress.nextSlug.toUpperCase()}
            </Link>
          )}
        </div>

        <div
          className="progress-meter"
          role="img"
          aria-label={`Progress ${progress.cleared} of ${progress.total} levels`}
        >
          <div
            className="progress-orb"
            style={{ '--progress': `${progress.percentage}` } as CSSProperties}
          >
            <div className="progress-orb__core">
              <span className="progress-orb__value">{String(progress.percentage).padStart(2, '0')}</span>
              <span className="progress-orb__unit">%</span>
            </div>
            <div className="progress-orb__halo" />
            <div className="progress-orb__echo" />
          </div>
          <div className="progress-readout">
            <span className="progress-readout__pair">
              <b>{progress.cleared}</b>
              <span>cleared</span>
            </span>
            <span className="progress-readout__pair">
              <b>{remaining}</b>
              <span>remaining</span>
            </span>
            {progress.nextTitle && (
              <span className="progress-readout__next">
                next: <strong>{progress.nextTitle}</strong>
              </span>
            )}
          </div>
        </div>

        <ul className="progress-steps" aria-label="Level signal timeline">
          {timeline.map((item) => (
            <li key={item.slug} className={`progress-step progress-step--${item.status}`}>
              <span className="progress-step__index">{String(item.num).padStart(3, '0')}</span>
              <span className="progress-step__slug">{item.slug.toUpperCase()}</span>
              <span className="progress-step__status">
                {item.status === 'cleared' ? 'Recovered' : item.status === 'next' ? 'Armed' : 'Sealed'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 data-echo="Recovered dossiers">Recovered dossiers</h2>
        {levels.length === 0 && <p><small>No clears yet.</small></p>}
        {levels.length > 0 && (
          <table className="table">
            <thead><tr><th>#</th><th>Title</th><th>Cleared</th><th /></tr></thead>
            <tbody>
              {levels.map(l=>(
                <tr key={l.slug}>
                  <td>{l.num}</td>
                  <td>{l.title}</td>
                  <td><small>{l.when.toISOString()}</small></td>
                  <td><Link className="btn" href={`/level/${l.slug}`} data-echo="Open dossier">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
