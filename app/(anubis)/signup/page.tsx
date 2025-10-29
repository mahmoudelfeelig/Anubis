'use client';
import { useState, FormEvent } from 'react';

export default function Page() {
  const [err, setErr] = useState<string>('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch('/api/signup', { method: 'POST', body: fd });
    if (r.ok) location.href = '/level/lv-001'; else setErr(await r.text());
  }
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <input name="username" placeholder="username" required />
      <input name="password" placeholder="password" type="password" required />
      <button>Create</button>
      {err && <p>{err}</p>}
    </form>
  );
}
