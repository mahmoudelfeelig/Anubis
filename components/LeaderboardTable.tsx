"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type LeaderboardRow = {
  rank: number;
  username: string;
  clears: number;
  lastIso: string;
};

type SortKey = "rank" | "username" | "clears" | "lastIso";

type Props = {
  rows: LeaderboardRow[];
};

const sortConfig: Record<SortKey, { label: string }> = {
  rank: { label: "#" },
  username: { label: "User" },
  clears: { label: "Clears" },
  lastIso: { label: "Last solve" },
};

export default function LeaderboardTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let result = 0;
      switch (sortKey) {
        case "rank":
          result = a.rank - b.rank;
          break;
        case "username":
          result = a.username.localeCompare(b.username);
          break;
        case "clears":
          result = a.clears - b.clears;
          break;
        case "lastIso":
          result = new Date(a.lastIso).getTime() - new Date(b.lastIso).getTime();
          break;
        default:
          result = 0;
      }
      return direction === "asc" ? result : -result;
    });
    return copy;
  }, [rows, sortKey, direction]);

  const toggleSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setDirection(nextKey === "username" ? "asc" : "desc");
    }
  };

  return (
    <div className="leaderboard-shell">
      <table className="table leaderboard-table">
        <thead>
          <tr>
            {(Object.keys(sortConfig) as SortKey[]).map((key) => (
              <th key={key}>
                <button
                  type="button"
                  onClick={() => toggleSort(key)}
                  className={sortKey === key ? "leaderboard-sort active" : "leaderboard-sort"}
                  aria-label={`Sort by ${sortConfig[key].label}`}
                >
                  <span>{sortConfig[key].label}</span>
                  <span className="leaderboard-sort__glyph" aria-hidden="true">
                    {sortKey === key ? (direction === "asc" ? "▲" : "▼") : "◇"}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={`${row.username}-${row.rank}`}>
              <td>{row.rank}</td>
              <td>
                <Link href={`/u/${row.username}`}>@{row.username}</Link>
              </td>
              <td>{row.clears}</td>
              <td>
                <small>{row.lastIso ? formatter.format(new Date(row.lastIso)) : "—"}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="leaderboard-empty">
          <small>No operatives found.</small>
        </p>
      )}
    </div>
  );
}
