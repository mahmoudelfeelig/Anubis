import "./globals.css";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import HorrorFX from "@/components/HorrorFX";
import { ensureIndexesOnce } from "@/lib/db";

export const metadata = {
  title: "Anubis",
  description: "Inspect. Decode. Advance.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureIndexesOnce();
  const year = new Date().getFullYear();
  return (
    <html lang="en" data-theme="dark">
      <body className="crt-root" data-theme="dark">
        <HorrorFX />
        <div className="crt-overlay" aria-hidden="true">
          <div className="crt-overlay__scanlines" />
          <div className="crt-overlay__noise" />
          <div className="crt-overlay__vignette" />
        </div>
        <div className="signal-burst" aria-hidden="true" />
        <header>
          <div className="container">
            <Nav />
          </div>
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer>
          <div className="container footer-bar">
            <small>© {year} Anubis</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
