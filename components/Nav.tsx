import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/session";
import { getUserProgressSummary } from "@/lib/progress";

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
            <Image src="/elephant-logo.png" alt="" width={32} height={32} priority />
            <b data-echo="Elfeel Archive">Elfeel Archive</b>
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
            <Image src="/elephant-logo.png" alt="" width={28} height={28} priority />
            <span data-echo="Elfeel Archive">Elfeel Archive</span>
          </Link>
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
