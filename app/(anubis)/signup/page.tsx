'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

async function readAuthError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || 'Signup failed.';
  } catch {
    return (await response.text()) || 'Signup failed.';
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
      const r = await fetch('/api/signup', { method: 'POST', body: fd });
      if (r.ok) {
        window.location.assign('/');
        return;
      }
      setErr(await readAuthError(r));
    } catch {
      setErr('Signup is unavailable right now.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel" style={{maxWidth:520,margin:'0 auto'}}>
      <h1>Sign up</h1>
      <form onSubmit={onSubmit} className="row">
        <label htmlFor="u">Username</label>
        <input id="u" className="input" name="username" required autoComplete="username" />
        <label htmlFor="p">Password</label>
        <input id="p" className="input" name="password" type="password" required autoComplete="new-password" />
        <button className="btn primary" disabled={pending}>{pending ? 'Creating' : 'Create'}</button>
        {err && <small style={{color:'#f88'}}>{err}</small>}
      </form>
      <p style={{marginTop:10}}><small>Have an account? <Link href="/login">Log in</Link></small></p>
    </section>
  );
}
