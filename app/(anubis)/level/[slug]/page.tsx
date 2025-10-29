import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getIndex, getLevel, getNextSlug } from '@/lib/levels';
import { getHighestCleared, markCleared } from '@/lib/progress';
import LevelRunner from '@/components/LevelRunner';

export default async function Page({ params:{ slug } }:{ params:{ slug:string } }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const index = await getIndex();
  const requested = index[slug];
  if (!requested) redirect('/locked');

  const highest = await getHighestCleared(user.id, index);
  if (requested > highest + 1) redirect('/locked');

  const level = await getLevel(slug);

  if (level.mode === 'url') {
    await markCleared(user.id, slug); // idempotent
  }

  const next = await getNextSlug(level.number);
  const safe = {
    slug: level.slug, number: level.number, title: level.title, kind: level.kind,
    mdx: level.mdx, asset: level.asset, theme: level.theme,
    hintsConsole: level.hintsConsole ?? [], hintsSource: level.hintsSource ?? [],
    next
  };

  return <LevelRunner level={safe} />;
}
