"use client";

import { useEffect } from "react";

const DEFAULT_X = 0.5;
const DEFAULT_Y = 0.5;

export default function HorrorFX() {
  useEffect(() => {
    const root = document.documentElement;
    const setCoords = (x: number, y: number) => {
      root.style.setProperty("--cursor-x", `${x}px`);
      root.style.setProperty("--cursor-y", `${y}px`);
    };

    let frame = 0;

    const schedule = (x: number, y: number) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCoords(x, y));
    };

    const handleMove = (event: PointerEvent) => {
      schedule(event.clientX, event.clientY);
    };

    const handleLeave = () => {
      schedule(window.innerWidth * DEFAULT_X, window.innerHeight * DEFAULT_Y);
    };

    const handleDown = () => {
      root.classList.remove("cursor-ripple-active");
      void root.offsetWidth;
      root.classList.add("cursor-ripple-active");
      window.setTimeout(() => {
        root.classList.remove("cursor-ripple-active");
      }, 320);
    };

    schedule(window.innerWidth * DEFAULT_X, window.innerHeight * DEFAULT_Y);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", handleLeave, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("pointerdown", handleDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="cursor-veil" aria-hidden="true" />
      <div className="horizon-tear" aria-hidden="true" />
    </>
  );
}
