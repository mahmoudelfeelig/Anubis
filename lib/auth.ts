import bcrypt from 'bcryptjs';

function passwordPepper() {
  const pepper = process.env.PWD_PEPPER;
  if (!pepper) throw new Error('PWD_PEPPER missing');
  return pepper;
}

export async function hashPwd(pwd: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pwd + passwordPepper(), salt);
}
export async function verifyPwd(pwd: string, hash: string) {
  return bcrypt.compare(pwd + passwordPepper(), hash);
}
