'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { solveForm } from '@/app/(anubis)/level/[slug]/actions';

type LevelSafe = {
  slug: string;
  number: number;
  title: string;
  kind?: string;
  mdx?: string;
  asset?: string;
  audio?: string;   // optional per-level override
  hintsConsole?: string[];
  hintsSource?: string[];
  theme?: { className?: string; cssVars?: Record<string, string> };
  next?: string | null;
};

export default function LevelRunner({ level }: { level: LevelSafe }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [msg, setMsg] = useState('');

  // Console + source hints
  useEffect(() => {
    (level.hintsConsole || []).forEach((h) =>
      console.log('%c' + h, 'font-size:12px;color:#b7c0c8')
    );
  }, [level]);

  // Audio bootstrap: try audible autoplay; if blocked, fallback to muted autoplay
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    // Configure once
    a.loop = true;
    a.autoplay = true;
    a.preload = 'auto';
    (a as any).playsInline = true; // iOS
    a.volume = 0.6;

    let cancelled = false;

    const tryAudible = async () => {
      try {
        a.muted = false;
        await a.play();                 // try audible autoplay
        if (!cancelled) {
          setNeedsGesture(false);
          setIsMuted(false);
        }
      } catch {
        // Fallback: keep it playing muted so unmute is instant later
        try {
          a.muted = true;
          await a.play();
          if (!cancelled) {
            setNeedsGesture(true);      // show "Enable audio"
            setIsMuted(true);
          }
        } catch {
          // If even muted autoplay fails, still show enable bar
          if (!cancelled) setNeedsGesture(true);
        }
      }
    };

    const onCanPlay = () => setReady(true);
    a.addEventListener('canplaythrough', onCanPlay);
    tryAudible();

    // If user interacts anywhere, try to unmute if we needed gesture
    const onFirstGesture = () => {
      if (!audioRef.current) return;
      if (needsGesture) {
        audioRef.current.muted = false;
        setIsMuted(false);
        setNeedsGesture(false);
      }
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
    window.addEventListener('pointerdown', onFirstGesture);
    window.addEventListener('keydown', onFirstGesture);

    return () => {
      cancelled = true;
      a.removeEventListener('canplaythrough', onCanPlay);
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, [level.slug]); // re-init per level

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    // Do NOT call play() here—keep stream running to avoid lag.
    a.muted = !a.muted;
    setIsMuted(a.muted);
    // If a was blocked and paused for some reason, a single user gesture here
    // will allow play(); call lightly:
    if (!a.muted && a.paused) {
      a.play().catch(() => {});
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const u = String(fd.get('u') || '');
    const p = String(fd.get('p') || '');
    const r = await solveForm(level.slug, u, p);
    setMsg(r.ok ? 'ok' : 'try again');
    if (r.ok && level.next) window.location.href = `/level/${level.next}`;
  };

  return (
    <div className={level.theme?.className} style={level.theme?.cssVars}>
      {/* source hints */}
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `<!-- ${(level.hintsSource || []).join(' | ')} -->`,
        }}
      />

      {/* primary visual (keep plain <img> so players can swap src in DevTools) */}
      {level.asset && (
        // eslint-disable-next-line @next/next/no-img-element
        <img id="p" src={`/levels/${level.slug}/${level.asset}`} alt="" />
      )}

      {/* answer form (for form-mode levels) */}
      <details style={{ marginTop: 12 }}>
        <summary>Submit answer</summary>
        <form onSubmit={onSubmit} className="row">
          <input name="u" className="input" placeholder="level username" autoComplete="off" />
          <input name="p" className="input" type="password" placeholder="level password" autoComplete="off" />
          <button className="btn">Submit</button>
        </form>
        {msg && <p><small>{msg}</small></p>}
      </details>

      {/* ambient audio element (default file if no per-level audio) */}
      <audio
        ref={audioRef}
        src={level.audio ? `/levels/${level.slug}/${level.audio}` : '/media/anubis_loop.mp3'}
        preload="auto"
        autoPlay
        // playsInline handled in effect (TS quirk)
        aria-hidden="true"
      />

      {/* Audio controls */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          zIndex: 10,
          display: 'flex',
          gap: 8,
          background: 'rgba(12,16,22,.85)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: '6px 10px',
        }}
      >
        {needsGesture ? (
          <button className="btn accent" onClick={toggleMute}>
            Enable audio
          </button>
        ) : (
          <button className="btn" onClick={toggleMute}>
            {isMuted ? 'Enable audio' : 'Mute audio'}
          </button>
        )}
      </div>
    </div>
  );
}
