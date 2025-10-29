'use client';
import { useEffect, useState, FormEvent } from 'react';
import { solveForm } from '@/app/(anubis)/level/[slug]/actions';

export default function LevelRunner({ level }: { level: any }) {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (level.hintsConsole||[]).forEach((h: string) => console.log('%c'+h, 'font-size:12px'));
  }, [level]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const u = String(fd.get('u')||'');
    const p = String(fd.get('p')||'');
    const r = await solveForm(level.slug, u, p);
    setMsg(r.ok ? 'ok' : 'try again');
    if (r.ok && level.next) window.location.href = `/level/${level.next}`;
  };

  return (
    <div className={level.theme?.className} style={level.theme?.cssVars}>
      <div suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `<!-- ${(level.hintsSource||[]).join(' | ')} -->` }} />
      {level.kind === 'mdx' && level.mdx && <article>{/* MDX injected below via next/mdx */}</article>}
      {level.asset && <img id="p" src={`/levels/${level.slug}/${level.asset}`} alt="" />}
      {level.kind === 'image' && !level.mdx && null}
      {/* Form-mode UI, included via MDX or always visible */}
      <details>
        <summary>Submit answer</summary>
        <form onSubmit={onSubmit}>
          <input name="u" placeholder="level username" autoComplete="off" />
          <input name="p" type="password" placeholder="level password" autoComplete="off" />
          <button>Submit</button>
        </form>
        {msg && <p>{msg}</p>}
      </details>
    </div>
  );
}
