'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

async function readAuthError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || 'Login failed.';
  } catch {
    return (await response.text()) || 'Login failed.';
  }
}

export default function Page() {
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/login', { method: 'POST', body: fd });
      if (r.ok) {
        window.location.assign('/');
        return;
      }
      setErr(await readAuthError(r));
    } catch {
      setErr('Login is unavailable right now.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel" style={{maxWidth:520,margin:'0 auto'}}>
      <h1>Log in</h1>
      <form onSubmit={onSubmit} className="row">
        <label htmlFor="u">Username</label>
        <input id="u" className="input" name="username" required autoComplete="username" />
        <label htmlFor="p">Password</label>
        <input id="p" className="input" name="password" type="password" required autoComplete="current-password" />
        <button className="btn primary" disabled={pending}>{pending ? 'Checking' : 'Enter'}</button>
        {err && <small style={{color:'#f88'}}>{err}</small>}
      </form>
      <p style={{marginTop:10}}><small>No account? <Link href="/signup">Sign up</Link></small></p>
    </section>
  );
}
