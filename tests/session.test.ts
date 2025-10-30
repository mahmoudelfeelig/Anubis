import crypto from 'node:crypto';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type CookieStore = {
  entries: Map<string, { value: string; options?: Record<string, unknown> }>;
  api: {
    get: (_key: string) => { value: string } | undefined;
    set: (_key: string, _cookieValue: string, _opts?: Record<string, unknown>) => void;
  };
};

function createCookieStore(): CookieStore {
  const entries = new Map<string, { value: string; options?: Record<string, unknown> }>();
  return {
    entries,
    api: {
      get: (_key: string) => {
        const record = entries.get(_key);
        return record ? { value: record.value } : undefined;
      },
      set: (key: string, cookieValue: string, opts?: Record<string, unknown>) => {
        entries.set(key, { value: cookieValue, options: opts });
      },
    },
  };
}

const dbControls = {
  sessions: {
    insertOne: vi.fn(),
    deleteOne: vi.fn(),
    findOne: vi.fn(),
  },
  users: {
    findOne: vi.fn(),
  },
};

let cookieStoreState: CookieStore;

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(async () => ({
    collection: (name: string) => {
      if (name === 'sessions') {
        return {
          insertOne: (...args: unknown[]) => dbControls.sessions.insertOne(...args),
          deleteOne: (...args: unknown[]) => dbControls.sessions.deleteOne(...args),
          findOne: (...args: unknown[]) => dbControls.sessions.findOne(...args),
        };
      }
      if (name === 'users') {
        return {
          findOne: (...args: unknown[]) => dbControls.users.findOne(...args),
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    },
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStoreState.api),
}));

let session: typeof import('@/lib/session');

beforeAll(async () => {
  session = await import('@/lib/session');
});

beforeEach(() => {
  cookieStoreState = createCookieStore();
  dbControls.sessions.insertOne = vi.fn();
  dbControls.sessions.deleteOne = vi.fn();
  dbControls.sessions.findOne = vi.fn();
  dbControls.users.findOne = vi.fn();
});

describe('createSession', () => {
  it('stores a hashed session token and sets a secure cookie', async () => {
    const randomBytesSpy = vi
      .spyOn(crypto, 'randomBytes')
      .mockImplementation((size: number) => Buffer.alloc(size ?? 32, 1));

    await session.createSession('user-42');

    expect(randomBytesSpy).toHaveBeenCalledWith(32);
    expect(dbControls.sessions.insertOne).toHaveBeenCalledTimes(1);
    const [doc] = dbControls.sessions.insertOne.mock.calls[0];
    expect(doc).toMatchObject({
      userId: 'user-42',
    });
    expect(doc.expiresAt).toBeInstanceOf(Date);
    expect(typeof doc.tokenHash).toBe('string');

    const cookie = cookieStoreState.entries.get('sid');
    expect(cookie).toBeDefined();
    expect(cookie!.value).toHaveLength(64); // 32 bytes hex
    expect(cookie!.options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    expect(cookie!.options?.expires).toBeInstanceOf(Date);

    const expectedHash = crypto.createHash('sha256').update(cookie!.value).digest('hex');
    expect(doc.tokenHash).toBe(expectedHash);
  });
});

describe('destroySession', () => {
  it('deletes the persisted session and clears the cookie', async () => {
    const token = 'deadbeef';
    cookieStoreState.entries.set('sid', { value: token });
    await session.destroySession();

    const expectedHash = crypto.createHash('sha256').update(token).digest('hex');
    expect(dbControls.sessions.deleteOne).toHaveBeenCalledWith({ tokenHash: expectedHash });

    const cleared = cookieStoreState.entries.get('sid');
    expect(cleared).toBeDefined();
    expect(cleared!.value).toBe('');
    expect(cleared!.options?.expires).toBeInstanceOf(Date);
  });

  it('is a no-op when no session cookie exists', async () => {
    await session.destroySession();
    expect(dbControls.sessions.deleteOne).not.toHaveBeenCalled();
  });
});

describe('getSessionUser', () => {
  it('returns null when no cookie is set', async () => {
    await expect(session.getSessionUser()).resolves.toBeNull();
    expect(dbControls.sessions.findOne).not.toHaveBeenCalled();
  });

  it('returns null when the session is not found', async () => {
    cookieStoreState.entries.set('sid', { value: 'missing' });
    dbControls.sessions.findOne.mockResolvedValue(null);
    await expect(session.getSessionUser()).resolves.toBeNull();
  });

  it('returns basic user info when session and user exist', async () => {
    const tokenValue = 'session';
    cookieStoreState.entries.set('sid', { value: tokenValue });
    const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
    dbControls.sessions.findOne.mockResolvedValue({
      tokenHash,
      userId: 'u-1',
      expiresAt: new Date(Date.now() + 1000),
    });
    dbControls.users.findOne.mockResolvedValue({ _id: 'u-1', username: 'scarab' });

    await expect(session.getSessionUser()).resolves.toEqual({
      id: 'u-1',
      username: 'scarab',
    });
  });
});








