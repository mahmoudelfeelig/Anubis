import { describe, expect, it, vi, type Mock } from 'vitest';

type AnyObj = Record<string, unknown>;

let configMock: Mock<[AnyObj], void>;
let uploadMock: Mock<[string, AnyObj?], Promise<{ public_id: string }>>;
let destroyMock: Mock<[string, AnyObj?], Promise<AnyObj>>;

async function loadModule() {
  // make sure every test starts from a clean module graph
  vi.resetModules();

  configMock = vi.fn();
  uploadMock = vi.fn(async () => ({ public_id: 'mocked/id' }));
  destroyMock = vi.fn(async () => ({}));

  // mock cloudinary before importing the module under test
  vi.doMock('cloudinary', () => ({
    v2: {
      config: configMock,
      uploader: {
        upload: uploadMock,
        destroy: destroyMock,
      },
    },
  }));

  // now import the real code
  return import('@/lib/storage-cloudinary');
}

describe('cloudinary configuration', () => {
  it('configures cloudinary client with env values on import', async () => {
    await loadModule();
    expect(configMock).toHaveBeenCalledWith({
      cloud_name: process.env.CLD_CLOUD_NAME,
      api_key: process.env.CLD_API_KEY,
      api_secret: process.env.CLD_API_SECRET,
      secure: true,
    });
  });
});

describe('saveUserAvatarCloudinary', () => {
  it('uploads sanitized avatar data and returns public id', async () => {
    const storageCloudinary = await loadModule();

    // stable timestamp so the public_id is deterministic
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const buffer = Buffer.from('avatar-bytes');

    const result = await storageCloudinary.saveUserAvatarCloudinary('user123', {
      name: 'evil<>avatar!!.png',
      data: buffer,
      type: 'image/png',
    });

    expect(uploadMock).toHaveBeenCalledTimes(1);

    const [dataUri, options] = uploadMock.mock.calls[0];

    // sent as data URI
    expect(typeof dataUri).toBe('string');
    expect(dataUri).toMatch(/^data:image\/png;base64,/);

    // cloudinary options
    expect(options).toMatchObject({
      folder: 'anubis/users/user123',
      resource_type: 'image',
      overwrite: true,
      unique_filename: false,
      invalidate: true,
    });

    // sanitized public id
    expect(options?.public_id).toBe('1700000000000-evil__avatar__');

    // function should return cloudinary's public_id
    expect(result).toBe('mocked/id');
  });

  it('throws when file is too large', async () => {
    const storageCloudinary = await loadModule();

    // 6MB + 1 byte
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024 + 1);

    await expect(
      storageCloudinary.saveUserAvatarCloudinary('user123', {
        name: 'big.png',
        data: bigBuffer,
        type: 'image/png',
      }),
    ).rejects.toThrow('too big');
  });
});

describe('avatarUrl', () => {
  it('builds a transformation url with provided size', async () => {
    const { avatarUrl } = await loadModule();

    const url = avatarUrl('anubis/users/user123/avatar', 128);

    // use the cloud name that is actually in the env in CI
    const cloudName =
      process.env.CLD_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME ??
      'demo-cloud';

    const pattern = new RegExp(
      `^https:\\/\\/res\\.cloudinary\\.com\\/${cloudName}\\/image\\/upload\\/f_auto,q_auto,c_fill,g_face,r_max,w_128,h_128\\/anubis\\/users\\/user123\\/avatar$`,
    );

    expect(url).toMatch(pattern);
  });
});

describe('destroyAsset', () => {
  it('invokes cloudinary destroy for provided public id', async () => {
    const storageCloudinary = await loadModule();

    await storageCloudinary.destroyAsset('mocked/id');

    expect(destroyMock).toHaveBeenCalledWith('mocked/id', {
      invalidate: true,
    });
  });

  it('skips destroy when no public id supplied', async () => {
    const storageCloudinary = await loadModule();

    await storageCloudinary.destroyAsset('');

    expect(destroyMock).not.toHaveBeenCalled();
  });
});
