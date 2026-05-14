import "./globals.css";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import HorrorFX from "@/components/HorrorFX";

export const metadata = {
  title: "Elfeel Archive",
  description: "Inspect. Decode. Advance.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/elephant-logo.png",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
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
            <small>© mahmoud elfeel 2026</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
