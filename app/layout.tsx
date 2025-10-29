import './globals.css';
import Nav from '@/components/Nav';
import { ensureIndexesOnce } from '@/lib/db';

export const metadata = {
  title: 'Anubis',
  description: 'Inspect. Decode. Advance.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureIndexesOnce();
  return (
    <html lang="en">
      <body>
        <header><div className="container"><Nav /></div></header>
        <main><div className="container">{children}</div></main>
        <footer><div className="container">© Anubis</div></footer>
      </body>
    </html>
  );
}
