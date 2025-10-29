'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function Page() {
  const [err, setErr] = useState('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch('/api/login', { method: 'POST', body: fd });
    if (r.ok) location.href = '/'; else setErr(await r.text());
  }
  return (
    <section className="panel" style={{maxWidth:520,margin:'0 auto'}}>
      <h1>Log in</h1>
      <form onSubmit={onSubmit} className="row">
        <label htmlFor="u">Username</label>
        <input id="u" className="input" name="username" required autoComplete="username" />
        <label htmlFor="p">Password</label>
        <input id="p" className="input" name="password" type="password" required autoComplete="current-password" />
        <button className="btn primary">Enter</button>
        {err && <small style={{color:'#f88'}}>{err}</small>}
      </form>
      <p style={{marginTop:10}}><small>No account? <Link href="/signup">Sign up</Link></small></p>
    </section>
  );
}
