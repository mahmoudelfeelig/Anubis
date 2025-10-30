'use client';
import { useState } from 'react';

export default function Avatar({
  src,
  size = 72,
  className,
}: {
  src?: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const url = !src || broken ? '/icon.png' : src;
  return (
    <span
      suppressHydrationWarning
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: '999px',
        border: '1px solid rgba(197, 34, 55, 0.35)',
        boxShadow: '0 6px 18px rgba(4, 6, 8, 0.55)',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 40% 30%, rgba(197,34,55,0.2), rgba(6,8,12,0.95))',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        suppressHydrationWarning
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </span>
  );
}
