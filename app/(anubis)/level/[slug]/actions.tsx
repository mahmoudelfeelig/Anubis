'use server';

import { scryptSync, timingSafeEqual } from 'node:crypto';
import { getLevel } from '@/lib/levels';
import { normalize } from '@/lib/normalize';
import { markCleared } from '@/lib/progress';
import { getSessionUser } from '@/lib/session';

function deriveKey(input: string, saltHex: string) {
  return scryptSync(input, Buffer.from(saltHex, 'hex'), 32);
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
  const expectedUser = Buffer.from(lvl.userHashHex ?? '', 'hex');
  const expectedPass = Buffer.from(lvl.passHashHex ?? '', 'hex');
  const ok =
    expectedUser.length === uKey.length &&
    expectedPass.length === pKey.length &&
    timingSafeEqual(uKey, expectedUser) &&
    timingSafeEqual(pKey, expectedPass);
  if (ok) await markCleared(user.id, slug);
  return { ok };
}
