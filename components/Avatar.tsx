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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      onError={() => setBroken(true)}
      className={className}
      style={{ borderRadius: '8px', border: '1px solid var(--line)', objectFit: 'cover' }}
    />
  );
}
