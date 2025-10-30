import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getUserProgressSummary } from "@/lib/progress";
import ThemeToggle from "./ThemeToggle";

export default async function Nav() {
  const user = await getSessionUser();
  const prog = user ? await getUserProgressSummary(user.id) : null;

  const baseLinks = [
    { href: "/levels", label: "Levels" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  if (user) {
    baseLinks.push({ href: `/u/${user.username}`, label: "Profile" });
  }

  return (
    <nav className="nav" aria-label="Primary navigation">
      <div className="nav-track">
        <div className="nav-brand">
          <Link href="/" className="brand" title="Home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#b0142f" d="M5 21l5-3 1-5-5-5 2-2 5 4 3-1 3-5 2 1-1 6-3 4 1 5-4 1-4 2z" />
            </svg>
            <b data-echo="Anubis">Anubis</b>
          </Link>
        </div>

        <div className="nav-links">
          {baseLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          {prog?.nextSlug && (
            <Link
              className="btn nav-last"
              href={`/level/${prog.nextSlug}`}
              title={prog.nextTitle ? `Resume ${prog.nextTitle}` : "Resume your next challenge"}
              data-echo="Resume Last Level"
            >
              Resume Last Level
            </Link>
          )}

          {!user && (
            <Link className="btn nav-login" href="/login" data-echo="Log in">
              Log in
            </Link>
          )}
        </div>
      </div>

      <details className="nav-mobile">
        <summary>
          <span>Menu</span>
          <span className="nav-mobile-glyph" aria-hidden="true">{'\u2630'}</span>
        </summary>
        <div className="nav-mobile-body">
          <Link href="/" className="nav-mobile-brand" title="Home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#b0142f" d="M5 21l5-3 1-5-5-5 2-2 5 4 3-1 3-5 2 1-1 6-3 4 1 5-4 1-4 2z" />
            </svg>
            <span data-echo="Anubis">Anubis</span>
          </Link>
          <ThemeToggle className="nav-theme--mobile" />
          {baseLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          {prog?.nextSlug && (
            <Link
              className="btn nav-last"
              href={`/level/${prog.nextSlug}`}
              title={prog.nextTitle ? `Resume ${prog.nextTitle}` : "Resume your next challenge"}
              data-echo="Resume Last Level"
            >
              Resume Last Level
            </Link>
          )}

          {!user && (
            <Link className="btn nav-login" href="/login" data-echo="Log in">
              Log in
            </Link>
          )}
        </div>
      </details>
    </nav>
  );
}
