"use client";

import { useCallback, useEffect, useRef, useState, FormEvent, startTransition } from "react";
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
  const [preferredState, setPreferredState] = useState<"playing" | "paused" | null>(null);
  const AUDIO_PREF_KEY = "anubis.audio.state";

  useEffect(() => {
    (level.hintsConsole || []).forEach((hint) => {
      console.warn(`%c${hint}`, "font-size:12px;color:#b7c0c8");
    });
  }, [level]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(AUDIO_PREF_KEY);
    startTransition(() => {
      if (saved === "paused" || saved === "playing") {
        setPreferredState(saved);
        setIsPaused(saved === "paused");
      } else {
        setPreferredState("playing");
        setIsPaused(false);
      }
    });
  }, [AUDIO_PREF_KEY]);

  const persistPreference = useCallback(
    (state: "playing" | "paused") => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUDIO_PREF_KEY, state);
      }
      startTransition(() => {
        setPreferredState(state);
        setIsPaused(state === "paused");
      });
    },
    [AUDIO_PREF_KEY],
  );

  const resumeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    wantsPauseRef.current = false;
    audio.muted = false;
    audio
      .play()
      .then(() => {
        startTransition(() => {
          setNeedsGesture(false);
          setIsPaused(false);
        });
        persistPreference("playing");
      })
      .catch(() => {
        startTransition(() => {
          setNeedsGesture(true);
          setIsPaused(true);
        });
      });
  }, [persistPreference]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || preferredState === null) return;

    audio.loop = true;
    audio.autoplay = true;
    audio.preload = "auto";
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audio.volume = 0.6;

    let cancelled = false;

    if (preferredState === "paused") {
      wantsPauseRef.current = true;
      audio.pause();
      audio.muted = true;
      startTransition(() => {
        setIsPaused(true);
        setNeedsGesture(false);
      });

      const onGesture = () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
      };
      window.addEventListener("pointerdown", onGesture);
      window.addEventListener("keydown", onGesture);
      return () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
      };
    }

    const startPlayback = async () => {
      try {
        audio.muted = false;
        wantsPauseRef.current = false;
        await audio.play();
        if (!cancelled) {
          startTransition(() => {
            setNeedsGesture(false);
            setIsPaused(false);
          });
        }
      } catch {
        try {
          audio.muted = true;
          wantsPauseRef.current = false;
          await audio.play();
          if (!cancelled) {
            startTransition(() => {
              setNeedsGesture(true);
              setIsPaused(true);
            });
          }
        } catch {
          if (!cancelled) {
            startTransition(() => {
              setNeedsGesture(true);
              setIsPaused(true);
            });
          }
        }
      }
    };

    void startPlayback();

    const onFirstGesture = () => {
      resumeAudio();
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
  }, [level.slug, resumeAudio, preferredState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (wantsPauseRef.current) return;
      audio.currentTime = 0;
      resumeAudio();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [resumeAudio]);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      resumeAudio();
    } else {
      wantsPauseRef.current = true;
      audio.pause();
      audio.muted = true;
      startTransition(() => {
        setIsPaused(true);
      });
      persistPreference("paused");
    }
  }, [persistPreference, resumeAudio]);

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

      <section className="submission">
        <header>
          <h2 data-echo="Rite of entry">Rite of entry</h2>
          <p>
            The gate keeps two names. Offer them in the order carved on the walls. A wrong whisper echoes back.
          </p>
        </header>
        <form onSubmit={onSubmit} className="submission-form">
          <label htmlFor="sub-u">Username sigil</label>
          <input id="sub-u" name="u" className="input submission-input" placeholder="etched in static" autoComplete="off" />
          <label htmlFor="sub-p">Password sigil</label>
          <input
            id="sub-p"
            name="p"
            className="input submission-input"
            type="password"
            placeholder="whisper in fragments"
            autoComplete="off"
          />
          <button className="btn submission-btn">Transmit</button>
        </form>
        {msg && (
          <p className={`submission-result ${msg === "ok" ? "success" : "error"}`}>
            {msg === "ok" ? "The door shifts." : "The ward rejects you."}
          </p>
        )}
      </section>

      <audio
        ref={audioRef}
        src={level.audio ? `/levels/${level.slug}/${level.audio}` : "/media/anubis_loop.mp3"}
        preload="auto"
        autoPlay
        aria-hidden="true"
      />

      <div className="audio-controls">
        <button type="button" className={`audio-btn${needsGesture ? " accent" : ""}`} onClick={toggleAudio}>
          {needsGesture || isPaused ? "Resume audio" : "Pause audio"}
        </button>
        {needsGesture && <span className="audio-hint">tap to awaken the loop</span>}
      </div>
    </div>
  );
}
