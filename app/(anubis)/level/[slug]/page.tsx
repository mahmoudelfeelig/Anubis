import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getIndex, getLevel, getNextSlug } from '@/lib/levels';
import { getHighestCleared, markCleared } from '@/lib/progress';
import { loadLevelPrompt } from '@/lib/mdx';

import LevelRunner from '@/components/LevelRunner';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) redirect('/login');

  let level;
  try {
    level = await getLevel(slug);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
      notFound();
    }
    throw error;
  }

  const index = await getIndex();
  const requested = typeof level.number === 'number' ? level.number : index[slug];

  const highest = await getHighestCleared(user.id, index);
  if (requested === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[level-page] slug not indexed', slug, 'index keys', Object.keys(index));
    }
    redirect('/locked');
  }
  if (requested > highest + 1) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[level-page] gating locked', { slug, requested, highest });
    }
    redirect('/locked');
  }

  if (level.mode === 'url') {
    await markCleared(user.id, slug);
  }

  const next = await getNextSlug(level.number);
  const promptContent = level.mdx ? await loadLevelPrompt(slug, level.mdx) : null;

  const safe = {
    slug: level.slug,
    number: level.number,
    title: level.title,
    kind: level.kind,
    mdx: level.mdx,
    asset: level.asset,
    audio: level.audio,
    theme: level.theme,
    hintsConsole: level.hintsConsole ?? [],
    hintsSource: level.hintsSource ?? [],
    next,
  };

  return (
    <section className="panel level-shell">
      <div className="level-meta" aria-label={`Level ${level.number}`}>
        <span className="level-meta__tag">LVL {String(level.number ?? '').padStart(2, '0')}</span>
        <span className="level-meta__title" data-echo={level.title}>
          {level.title}
        </span>
      </div>
      {promptContent && <article className="level-mdx">{promptContent}</article>}
      <LevelRunner level={safe} />
    </section>
  );
}



