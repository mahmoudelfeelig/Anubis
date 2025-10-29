import Link from 'next/link';

export default function Page() {
  return (
    <section className="panel">
      <h1>Access locked</h1>
      <p><small>You better get your b******s up outta here and go finish the previous ones first</small></p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:8}}>
        <Link href="/" className="btn">← Home</Link>
        <Link href="/levels" className="btn">Your levels</Link>
        <Link href="/hints" className="btn">Hints</Link>
      </div>
    </section>
  );
}

