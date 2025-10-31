import "./globals.css";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import { ensureIndexesOnce } from "@/lib/db";

export const metadata = {
  title: "Anubis",
  description: "Inspect. Decode. Advance.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureIndexesOnce();
  return (
    <html lang="en" data-theme="dark">
      <body className="crt-root" data-theme="dark">
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
          <div className="container">Ac Anubis</div>
        </footer>
      </body>
    </html>
  );
}
