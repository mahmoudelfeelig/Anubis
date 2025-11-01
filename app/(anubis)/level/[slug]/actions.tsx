'use server';

import { scrypt } from '@noble/hashes/scrypt';
import { hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
import { getLevel } from '@/lib/levels';
import { normalize } from '@/lib/normalize';
import { markCleared } from '@/lib/progress';
import { getSessionUser } from '@/lib/session';

function deriveKey(input: string, saltHex: string) {
  const password = utf8ToBytes(input);
  const salt = hexToBytes(saltHex);
  return scrypt(password, salt, { N: 2 ** 14, r: 8, p: 1, dkLen: 32 });
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export async function solveForm(slug: string, uRaw: string, pRaw: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, msg: 'auth' };
  const lvl = await getLevel(slug);
  if (lvl.mode !== 'form' || !lvl.saltHex) return { ok: false, msg: 'mode' };

  const nU = normalize(uRaw);
  const nP = normalize(pRaw);
  const uKey = deriveKey(nU, lvl.saltHex);
  const pKey = deriveKey(nP, lvl.saltHex);
  const ok =
    constantTimeEquals(uKey, hexToBytes(lvl.userHashHex ?? '')) &&
    constantTimeEquals(pKey, hexToBytes(lvl.passHashHex ?? ''));
  if (ok) await markCleared(user.id, slug);
  return { ok };
}
