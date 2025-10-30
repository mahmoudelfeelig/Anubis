import { beforeEach, describe, expect, it, vi } from 'vitest';

let configMock: ReturnType<typeof vi.fn>;
let uploadMock: ReturnType<typeof vi.fn>;
let destroyMock: ReturnType<typeof vi.fn>;

async function loadModule() {
  vi.resetModules();
  configMock = vi.fn();
  uploadMock = vi.fn(async () => ({ public_id: 'mocked/id' }));
  destroyMock = vi.fn(async () => ({}));

  vi.doMock('cloudinary', () => ({
    v2: {
      config: configMock,
      uploader: {
        upload: uploadMock,
        destroy: destroyMock,
      },
    },
  }));

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
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const buffer = Buffer.from('avatar-bytes');
    const result = await storageCloudinary.saveUserAvatarCloudinary('user123', {
      name: 'evil<>avatar!!.png',
      data: buffer,
      type: 'image/png',
    });

    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [dataUri, options] = uploadMock.mock.calls[0];
    expect(typeof dataUri).toBe('string');
    expect(dataUri).toMatch(/^data:image\/png;base64,/);
    expect(options).toMatchObject({
      folder: 'anubis/users/user123',
      resource_type: 'image',
      overwrite: true,
      unique_filename: false,
      invalidate: true,
    });
    expect(options.public_id).toBe('1700000000000-evil__avatar__');
    expect(result).toBe('mocked/id');
  });

  it('throws when file is too large', async () => {
    const storageCloudinary = await loadModule();
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
    expect(url).toMatch(
      /^https:\/\/res\.cloudinary\.com\/demo-cloud\/image\/upload\/f_auto,q_auto,c_fill,g_face,r_max,w_128,h_128\/anubis\/users\/user123\/avatar$/,
    );
  });
});

describe('destroyAsset', () => {
  it('invokes cloudinary destroy for provided public id', async () => {
    const storageCloudinary = await loadModule();
    await storageCloudinary.destroyAsset('mocked/id');
    expect(destroyMock).toHaveBeenCalledWith('mocked/id', { invalidate: true });
  });

  it('skips destroy when no public id supplied', async () => {
    const storageCloudinary = await loadModule();
    await storageCloudinary.destroyAsset('');
    expect(destroyMock).not.toHaveBeenCalled();
  });
});
