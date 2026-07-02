import type { Db, MongoClient as MongoClientType } from 'mongodb';

type G = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClientType>;
  _mongoIndexesEnsured?: boolean;
};

const g = globalThis as G;

function mongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  return uri;
}

async function getClient(): Promise<MongoClientType> {
  if (!g._mongoClientPromise) {
    g._mongoClientPromise = (async () => {
      const { MongoClient, ServerApiVersion } = await import('mongodb');
      const client = new MongoClient(mongoUri(), {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
        serverSelectionTimeoutMS: 8000,
      });
      await client.connect();
      return client;
    })();
    g._mongoIndexesEnsured = false;
  }

  return g._mongoClientPromise;
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection('users').createIndex({ username: 1 }, { unique: true, name: 'users_username_uq' }),
    db.collection('users').createIndex({ createdAt: -1 }, { name: 'users_created_desc' }),

    db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true, name: 'sessions_token_uq' }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'sessions_ttl' }),

    db.collection('user_levels').createIndex({ userId: 1, slug: 1 }, { unique: true, name: 'levels_user_slug_uq' }),
    db.collection('user_levels').createIndex({ clearedAt: -1 }, { name: 'levels_clearedAt_desc' }),

    db.collection('files').createIndex({ userId: 1, type: 1, createdAt: -1 }, { name: 'files_user_type_created' }),
    db.collection('files').createIndex({ key: 1 }, { unique: true, name: 'files_key_uq' }),
  ]);
}

export async function ensureIndexesOnce(existingDb?: Db): Promise<void> {
  if (g._mongoIndexesEnsured) return;
  const db = existingDb ?? (await getClient()).db();
  await ensureIndexes(db);
  g._mongoIndexesEnsured = true;
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await getClient();
  const db = dbName ? client.db(dbName) : client.db();
  if (!g._mongoIndexesEnsured) {
    await ensureIndexesOnce(db);
  }
  return db;
}
