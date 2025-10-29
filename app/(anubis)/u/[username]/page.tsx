export const runtime = 'nodejs';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getLevel } from '@/lib/levels';
import { getSessionUser } from '@/lib/session';
import { updatePfp as doUpdatePfp, changePassword as doChangePassword } from './profile-actions';
import { avatarUrl } from '@/lib/storage-cloudinary';
import Avatar from '@/components/Avatar';

async function getProfile(username: string) {
  const db = await getDb();
  const u = await db.collection('users').findOne<{ _id: string; username: string; pfp?: string }>(
    { username: username.toLowerCase() },
    { projection: { _id: 1, username: 1, pfp: 1 } }
  );
  if (!u) return null;

  const rows = await db
    .collection('user_levels')
    .find({ userId: u._id })
    .project<{ slug: string; clearedAt: Date }>({ slug: 1, clearedAt: 1 })
    .sort({ clearedAt: -1 })
    .toArray();

  const levels = await Promise.all(
    rows.map(async (r) => {
      const cfg = await getLevel(r.slug);
      return { slug: r.slug, title: cfg.title, num: cfg.number, when: r.clearedAt };
    })
  );

  return { id: u._id, username: u.username, pfp: u.pfp ?? '', levels };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;

  const me = await getSessionUser();
  const prof = await getProfile(username);
  if (!prof) notFound();
  const isSelf = me?.username === prof.username;

  // Bind server actions locally (required)
  async function updatePfpAction(form: FormData) {
    'use server';
    await doUpdatePfp(form);
  }
  async function changePasswordAction(form: FormData) {
    'use server';
    await doChangePassword(form);
  }

  return (
    <div className="grid cols-2">
      <section className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={prof.pfp ? avatarUrl(prof.pfp, 72) : undefined} size={72} />
          <div>
            <h1>@{prof.username}</h1>
            <small>{prof.levels.length} clears</small>
            {sp.err === 'pfp' && (
              <div><small style={{ color: '#f88' }}>Avatar upload failed.</small></div>
            )}
            {sp.ok === 'pfp' && (
              <div><small style={{ color: '#8f8' }}>Avatar updated.</small></div>
            )}
            {sp.ok === 'pw' && (
              <div><small style={{ color: '#8f8' }}>Password changed.</small></div>
            )}
          </div>
        </div>

        {isSelf && (
          <form
            action={updatePfpAction}
            encType="multipart/form-data"
            className="row"
            style={{ marginTop: 14 }}
          >
            <input type="hidden" name="userId" value={prof.id} />
            <label htmlFor="pfp">Profile image (png/jpg/gif/webp, ≤1MB)</label>
            <input id="pfp" className="input" name="pfp" type="file" accept="image/*" />
            <button className="btn">Upload</button>
          </form>
        )}

        {isSelf && (
          <form
            action={changePasswordAction}
            className="row"
            style={{ marginTop: 14 }}
          >
            <input type="hidden" name="userId" value={prof.id} />
            <label htmlFor="old">Current password</label>
            <input id="old" name="old" type="password" className="input" />
            <label htmlFor="nw">New password</label>
            <input id="nw" name="nw" type="password" className="input" />
            <button className="btn">Change password</button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>Cleared</h2>
        {prof.levels.length === 0 && <p><small>None yet.</small></p>}
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>When</th><th />
            </tr>
          </thead>
          <tbody>
            {prof.levels.map((l) => (
              <tr key={l.slug}>
                <td>{l.num}</td>
                <td>{l.title}</td>
                <td><small>{l.when.toISOString()}</small></td>
                <td><Link className="btn" href={`/level/${l.slug}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
