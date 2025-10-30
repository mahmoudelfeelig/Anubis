import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getIndex, getLevel } from "@/lib/levels";
import { getDb } from "@/lib/db";

async function getProgress(userId: string) {
  const db = await getDb();
  const index = await getIndex();
  const total = Object.keys(index).length;
  const clearedRows = await db
    .collection("user_levels")
    .find({ userId })
    .project<{ slug: string }>({ slug: 1 })
    .toArray();

  const inverted = Object.entries(index).reduce<Record<number, string>>((acc, [slug, num]) => {
    if (typeof num === "number") acc[num] = slug;
    return acc;
  }, {});

  const clearedNumbers = new Set(
    clearedRows
      .map((row) => index[row.slug])
      .filter((num): num is number => typeof num === "number"),
  );

  let nextNumber: number | null = null;
  for (let i = 1; i <= total; i++) {
    if (!clearedNumbers.has(i)) {
      nextNumber = i;
      break;
    }
  }

  let nextSlug: string | null = null;
  let nextTitle: string | null = null;
  if (nextNumber !== null) {
    const slug = inverted[nextNumber];
    if (slug) {
      nextSlug = slug;
      nextTitle = (await getLevel(slug)).title;
    }
  }

  return { total, cleared: clearedNumbers.size, nextSlug, nextTitle };
}

export default async function Nav() {
  const user = await getSessionUser();
  const prog = user ? await getProgress(user.id) : null;
  const pct = prog ? Math.round((prog.cleared / Math.max(1, prog.total)) * 100) : 0;

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
            <b>Anubis</b>
          </Link>
        </div>

        <div className="nav-links">
          {baseLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          {user && prog && (
            <div className="nav-progress" aria-label={`Progress ${prog.cleared} out of ${prog.total}`}>
              <span className="nav-progress-label">
                {prog.cleared}/{prog.total}
              </span>
              <div className="progress nav-progress-bar">
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="nav-actions">
          {prog?.nextSlug && (
            <Link
              className="btn nav-last"
              href={`/level/${prog.nextSlug}`}
              title={prog.nextTitle ? `Resume ${prog.nextTitle}` : "Resume your next challenge"}
            >
              Resume Last Level
            </Link>
          )}

          {!user && (
            <Link className="btn nav-login" href="/login">
              Log in
            </Link>
          )}
        </div>
      </div>

      <details className="nav-mobile">
        <summary>
          <span>Menu</span>
          <span className="nav-mobile-glyph" aria-hidden="true">
            ?
          </span>
        </summary>
        <div className="nav-mobile-body">
          {baseLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          {user && prog && (
            <div className="nav-mobile-progress">
              <span className="nav-progress-label">
                {prog.cleared}/{prog.total}
              </span>
              <div className="progress nav-progress-bar">
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {prog?.nextSlug && (
            <Link
              className="btn nav-last"
              href={`/level/${prog.nextSlug}`}
              title={prog.nextTitle ? `Resume ${prog.nextTitle}` : "Resume your next challenge"}
            >
              Resume Last Level
            </Link>
          )}

          {!user && (
            <Link className="btn nav-login" href="/login">
              Log in
            </Link>
          )}
        </div>
      </details>
    </nav>
  );
}
