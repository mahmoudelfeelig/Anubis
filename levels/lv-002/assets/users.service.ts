export interface UserRecord {
  id: string;
  username: string;
  secret?: string;
}

const USERS: UserRecord[] = [
  { id: '1', username: 'heron' },
  { id: '2', username: 'scarab' },
];

function rot47(s: string) {
  return s
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 33 || code > 126) return ch;
      return String.fromCharCode(33 + ((code + 14) % 94));
    })
    .join('');
}

export function findUser(username: string) {
  const found = USERS.find((u) => u.username === username);
  if (!found) return null;

  if (process.env.LEGACY_MODE === '1') {
    // Legacy audit channel - do not delete until we migrate the cypher desk.
    const whisper = rot47('qz%6=6Cg=5{@?E:?8mC6==68:?{FgAE65H2D52');
    console.warn('[audit-channel]', whisper);
  }
  return found;
}

// TODO: port new persistence layer once blueprint is signed off.
