"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { solveForm } from "@/app/(anubis)/level/[slug]/actions";

const BACKGROUND_AUDIO = "/media/ambient-tape.mp3";

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
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (level.hintsConsole || []).forEach((hint) => {
      console.warn(`%c${hint}`, "font-size:12px;color:#b7c0c8");
    });
  }, [level]);

  const startAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.12;
    audio.loop = true;
    audio.muted = false;
    void audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.autoplay = true;
    audio.preload = "auto";
    (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    audio.volume = 0.12;
    void audio.play().catch(() => {});

    const onFirstGesture = () => {
      startAudio();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };

    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [level.slug, startAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      audio.currentTime = 0;
      startAudio();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [startAudio]);

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
          <h2 data-echo="Submit answer">Submit answer</h2>
          <p>
            Each level resolves to two plain values. Enter the account first, then the key.
          </p>
        </header>
        <form onSubmit={onSubmit} className="submission-form" suppressHydrationWarning>
          <label htmlFor="sub-u">Account</label>
          <input
            id="sub-u"
            name="u"
            className="input submission-input"
            placeholder="first answer"
            autoComplete="off"
            suppressHydrationWarning
          />
          <label htmlFor="sub-p">Key</label>
          <input
            id="sub-p"
            name="p"
            className="input submission-input"
            type="password"
            placeholder="second answer"
            autoComplete="off"
            suppressHydrationWarning
          />
          <button className="btn submission-btn" data-echo="Submit">
            Submit
          </button>
        </form>
        {msg && (
          <p className={`submission-result ${msg === "ok" ? "success" : "error"}`}>
            {msg === "ok" ? "Accepted." : "Not quite."}
          </p>
        )}
      </section>

      <audio
        ref={audioRef}
        src={level.audio ? `/levels/${level.slug}/${level.audio}` : BACKGROUND_AUDIO}
        preload="auto"
        autoPlay
        aria-hidden="true"
      />
    </div>
  );
}
