import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadStorage() {
  vi.resetModules();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'elfeel-uploads-'));
  process.env.UPLOAD_DIR = root;
  const mod = await import('@/lib/storage-local');
  return { root, mod };
}

afterEach(() => {
  delete process.env.UPLOAD_DIR;
});

describe('local avatar storage', () => {
  it('stores gif avatars under a safe key and returns a served url', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const { root, mod } = await loadStorage();

    const key = await mod.saveUserAvatar('User <> 1', {
      name: 'profile dance!!.gif',
      data: Buffer.from('GIF89a'),
      type: 'image/gif',
    });

    expect(key).toMatch(/^avatars\/user-1\/1700000000000-[a-f0-9-]+-profile-dance\.gif$/);
    expect(mod.avatarUrl(key)).toBe(`/uploads/${key}`);
    await expect(fs.readFile(path.join(root, key), 'utf8')).resolves.toBe('GIF89a');
  });

  it('rejects unsupported avatar types', async () => {
    const { mod } = await loadStorage();

    await expect(
      mod.saveUserAvatar('u1', {
        name: 'avatar.svg',
        data: Buffer.from('<svg />'),
        type: 'image/svg+xml',
      }),
    ).rejects.toThrow('bad type');
  });

  it('deletes stored files without failing on missing old keys', async () => {
    const { mod } = await loadStorage();
    const key = await mod.saveUserAvatar('u1', {
      name: 'avatar.png',
      data: Buffer.from('png'),
      type: 'image/png',
    });

    await mod.destroyAsset(key);
    await expect(mod.readUpload(key)).rejects.toThrow();
    await expect(mod.destroyAsset(key)).resolves.toBeUndefined();
  });
});
