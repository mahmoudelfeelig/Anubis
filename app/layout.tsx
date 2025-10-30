import './globals.css';
import type { ReactNode } from 'react';
import Nav from '@/components/Nav';
import { ensureIndexesOnce } from '@/lib/db';

const themeInitScript = `
(function() {
  try {
    var storageKey = 'anubis.theme';
    var doc = document.documentElement;
    var stored = localStorage.getItem(storageKey);
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    doc.dataset.theme = theme;
    var applyToBody = function() {
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function handler() {
        applyToBody();
        document.removeEventListener('DOMContentLoaded', handler);
      });
    } else {
      applyToBody();
    }
  } catch (err) {
    // ignore
  }
})();
`;

export const metadata = {
  title: 'Anubis',
  description: 'Inspect. Decode. Advance.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureIndexesOnce();
  return (
    <html lang="en" data-theme="dark">
      <body className="crt-root" data-theme="dark">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="crt-overlay" aria-hidden="true">
          <div className="crt-overlay__scanlines" />
          <div className="crt-overlay__noise" />
          <div className="crt-overlay__vignette" />
        </div>
        <div className="signal-burst" aria-hidden="true" />
        <header><div className="container"><Nav /></div></header>
        <main><div className="container">{children}</div></main>
        <footer><div className="container">© Anubis</div></footer>
      </body>
    </html>
  );
}
