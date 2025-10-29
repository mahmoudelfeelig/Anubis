import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { getLevel } from '@/lib/levels';

export default async function Page() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const db = await getDb();
  const rows = await db.collection('user_levels').find({ userId: user.id })
    .project<{ slug:string, clearedAt:Date }>({ slug:1, clearedAt:1 })
    .sort({ clearedAt:-1 }).toArray();

  const levels = await Promise.all(rows.map(async r => {
    const cfg = await getLevel(r.slug);
    return { slug:r.slug, title:cfg.title, num:cfg.number, when:r.clearedAt };
  }));

  return (
    <section className="panel">
      <h1>Finished levels</h1>
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
                <td><Link className="btn" href={`/level/${l.slug}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
