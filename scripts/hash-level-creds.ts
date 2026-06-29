/* eslint-disable no-console */
import crypto from 'node:crypto';
import { normalize } from '../lib/normalize';

const u = normalize(process.argv[2] || '');
const p = normalize(process.argv[3] || '');
const salt = crypto.randomBytes(16);
crypto.scrypt(u, salt, 32, (e, uKey) => {
  if (e) throw e;
  crypto.scrypt(p, salt, 32, (e2, pKey) => {
    if (e2) throw e2;
    console.log('saltHex:', salt.toString('hex'));
    console.log('userHashHex:', Buffer.from(uKey).toString('hex'));
    console.log('passHashHex:', Buffer.from(pKey).toString('hex'));
  });
});

