import { getSessionUser } from '@/lib/session';
export default async function Page() {
  const u = await getSessionUser();
  if (!u) return <p>Not logged in.</p>;
  return <p>User: {u.username}</p>;
}
