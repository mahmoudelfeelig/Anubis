"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { solveForm } from "@/app/(anubis)/level/[slug]/actions";

type LevelSafe = {
  slug: string;
  number: number;
  title: string;
  kind?: string;
  mdx?: string;
  asset?: string;
  audio?: string;
  hintsConsole?: string[];
  hintsSource?: string[];
  theme?: { className?: string; cssVars?: Record<string, string> };
  next?: string | null;
};

export default function LevelRunner({ level }: { level: LevelSafe }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [msg, setMsg] = useState("");
  const wantsPauseRef = useRef(false);

  useEffect(() => {
    (level.hintsConsole || []).forEach((hint) => {
      console.warn(`%c${hint}`, "font-size:12px;color:#b7c0c8");
    });
  }, [level]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.autoplay = true;
    audio.preload = "auto";
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audio.volume = 0.6;

    let cancelled = false;

    const startPlayback = async () => {
      try {
        audio.muted = false;
        wantsPauseRef.current = false;
        await audio.play();
        if (!cancelled) setNeedsGesture(false);
      } catch {
        try {
          audio.muted = true;
          wantsPauseRef.current = false;
          await audio.play();
          if (!cancelled) setNeedsGesture(true);
        } catch {
          if (!cancelled) setNeedsGesture(true);
        }
      }
    };

    void startPlayback();

    const onFirstGesture = () => {
      const player = audioRef.current;
      if (!player) return;
      if (needsGesture) {
        player.muted = false;
        wantsPauseRef.current = false;
        player.play().catch(() => {});
        setNeedsGesture(false);
      }
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };

    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [level.slug, needsGesture]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (wantsPauseRef.current) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const togglePause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      wantsPauseRef.current = false;
      audio.play().catch(() => {});
      setIsPaused(false);
    } else {
      wantsPauseRef.current = true;
      audio.pause();
      setIsPaused(true);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("u") || "");
    const password = String(form.get("p") || "");
    const result = await solveForm(level.slug, username, password);
    setMsg(result.ok ? "ok" : "try again");
    if (result.ok && level.next) {
      window.location.href = `/level/${level.next}`;
    }
  };

  return (
    <div className={level.theme?.className} style={level.theme?.cssVars}>
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `<!-- ${(level.hintsSource || []).join(" | ")} -->`,
        }}
      />

      {level.asset && (
        // eslint-disable-next-line @next/next/no-img-element
        <img id="p" src={`/levels/${level.slug}/${level.asset}`} alt="" />
      )}

      <details style={{ marginTop: 12 }}>
        <summary>Submit answer</summary>
        <form onSubmit={onSubmit} className="row">
          <input name="u" className="input" placeholder="level username" autoComplete="off" />
          <input name="p" className="input" type="password" placeholder="level password" autoComplete="off" />
          <button className="btn">Submit</button>
        </form>
        {msg && (
          <p>
            <small>{msg}</small>
          </p>
        )}
      </details>

      <audio
        ref={audioRef}
        src={level.audio ? `/levels/${level.slug}/${level.audio}` : "/media/anubis_loop.mp3"}
        preload="auto"
        autoPlay
        aria-hidden="true"
      />

      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 10,
          display: "flex",
          gap: 8,
          background: "rgba(12,16,22,.85)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: "6px 10px",
        }}
      >
        {needsGesture ? (
          <button className="btn accent" onClick={togglePause}>
            Enable audio
          </button>
        ) : (
          <button className="btn" onClick={togglePause}>
            {isPaused ? "Enable audio" : "Pause audio"}
          </button>
        )}
      </div>
    </div>
  );
}
