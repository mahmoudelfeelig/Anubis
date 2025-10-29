'use server';
import crypto from 'node:crypto';
import { getLevel } from '@/lib/levels';
import { normalize } from '@/lib/normalize';
import { markCleared } from '@/lib/progress';
import { getSessionUser } from '@/lib/session';

function scryptBuf(data: string, salt: Buffer) {
  return new Promise<Buffer>((res, rej) => crypto.scrypt(data, salt, 32, (e, k) => e ? rej(e) : res(k as Buffer)));
}

export async function solveForm(slug: string, uRaw: string, pRaw: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false, msg: 'auth' };
  const lvl = await getLevel(slug);
  if (lvl.mode !== 'form' || !lvl.saltHex) return { ok:false, msg:'mode' };

  const nU = normalize(uRaw), nP = normalize(pRaw);
  const salt = Buffer.from(lvl.saltHex, 'hex');
  const [uKey, pKey] = await Promise.all([scryptBuf(nU, salt), scryptBuf(nP, salt)]);
  const ok = crypto.timingSafeEqual(uKey, Buffer.from(lvl.userHashHex!, 'hex'))
         && crypto.timingSafeEqual(pKey, Buffer.from(lvl.passHashHex!, 'hex'));
  if (ok) await markCleared(user.id, slug);
  return { ok };
}
