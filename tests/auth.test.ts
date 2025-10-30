import { beforeEach, describe, expect, it } from 'vitest';

describe('auth helpers', () => {
  beforeEach(() => {
    process.env.PWD_PEPPER = 'test-pepper';
  });

  it('hashes and verifies a password with pepper', async () => {
    const { hashPwd, verifyPwd } = await import('@/lib/auth');
    const password = 'hunter2';
    const hash = await hashPwd(password);
    expect(hash).not.toBe(password);
    await expect(verifyPwd(password, hash)).resolves.toBe(true);
    await expect(verifyPwd('wrong', hash)).resolves.toBe(false);
  });
});

