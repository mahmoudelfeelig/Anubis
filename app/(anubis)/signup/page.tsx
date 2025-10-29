'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function Page() {
  const [err, setErr] = useState('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch('/api/signup', { method: 'POST', body: fd });
    if (r.ok) location.href = '/'; else setErr(await r.text());
  }
  return (
    <section className="panel" style={{maxWidth:520,margin:'0 auto'}}>
      <h1>Sign up</h1>
      <form onSubmit={onSubmit} className="row">
        <label htmlFor="u">Username</label>
        <input id="u" className="input" name="username" required />
        <label htmlFor="p">Password</label>
        <input id="p" className="input" name="password" type="password" required />
        <button className="btn primary">Create</button>
        {err && <small style={{color:'#f88'}}>{err}</small>}
      </form>
      <p style={{marginTop:10}}><small>Have an account? <Link href="/login">Log in</Link></small></p>
    </section>
  );
}
