import { describe, expect, it, vi } from 'vitest';

type CollectionMocks = Record<string, { createIndex: ReturnType<typeof vi.fn> }>;

async function loadDbModule() {
  vi.resetModules();

  const collections: CollectionMocks = {
    users: { createIndex: vi.fn().mockResolvedValue(undefined) },
    sessions: { createIndex: vi.fn().mockResolvedValue(undefined) },
    user_levels: { createIndex: vi.fn().mockResolvedValue(undefined) },
    files: { createIndex: vi.fn().mockResolvedValue(undefined) },
  };

  class MockMongoClient {
    connect() {
      return Promise.resolve(this);
    }
    db() {
      return {
        collection: (name: string) => {
          if (!collections[name]) {
            throw new Error(`Unexpected collection: ${name}`);
          }
          return collections[name];
        },
      };
    }
  }

  vi.doMock('mongodb', () => ({ MongoClient: MockMongoClient }));

  delete (globalThis as any)._mongoClientPromise;
  delete (globalThis as any)._mongoIndexesEnsured;

  const mod = await import('@/lib/db');
  return { ...mod, collections };
}

describe('ensureIndexesOnce', () => {
  it('creates expected indexes the first time it runs', async () => {
    const { ensureIndexesOnce, collections } = await loadDbModule();

    await ensureIndexesOnce();

    expect(collections.users.createIndex).toHaveBeenNthCalledWith(
      1,
      { username: 1 },
      { unique: true, name: 'users_username_uq' },
    );
    expect(collections.users.createIndex).toHaveBeenNthCalledWith(
      2,
      { createdAt: -1 },
      { name: 'users_created_desc' },
    );
    expect(collections.sessions.createIndex).toHaveBeenNthCalledWith(
      1,
      { tokenHash: 1 },
      { unique: true, name: 'sessions_token_uq' },
    );
    expect(collections.sessions.createIndex).toHaveBeenNthCalledWith(
      2,
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'sessions_ttl' },
    );
    expect(collections.user_levels.createIndex).toHaveBeenNthCalledWith(
      1,
      { userId: 1, slug: 1 },
      { unique: true, name: 'levels_user_slug_uq' },
    );
    expect(collections.user_levels.createIndex).toHaveBeenNthCalledWith(
      2,
      { clearedAt: -1 },
      { name: 'levels_clearedAt_desc' },
    );
    expect(collections.files.createIndex).toHaveBeenNthCalledWith(
      1,
      { userId: 1, type: 1, createdAt: -1 },
      { name: 'files_user_type_created' },
    );
    expect(collections.files.createIndex).toHaveBeenNthCalledWith(
      2,
      { key: 1 },
      { unique: true, name: 'files_key_uq' },
    );
  });

  it('skips index creation on subsequent calls', async () => {
    const { ensureIndexesOnce, collections } = await loadDbModule();

    await ensureIndexesOnce();
    await ensureIndexesOnce();

    expect(collections.users.createIndex).toHaveBeenCalledTimes(2);
  });
});
