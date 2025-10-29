import bcrypt from 'bcryptjs';
const PEPPER = process.env.PWD_PEPPER!;
if (!PEPPER) throw new Error('PWD_PEPPER missing');

export async function hashPwd(pwd: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pwd + PEPPER, salt);
}
export async function verifyPwd(pwd: string, hash: string) {
  return bcrypt.compare(pwd + PEPPER, hash);
}
