import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('MONGODB_URI missing');

type G = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoIndexesEnsured?: boolean;
};

const g = globalThis as G;

if (!g._mongoClientPromise) {
  g._mongoClientPromise = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  }).connect();
}

export async function getDb(): Promise<Db> {
  const client = await g._mongoClientPromise!;
  return client.db(); // DB name from URI
}

/** Call once per process, safe to call from layout */
export async function ensureIndexesOnce() {
  if (g._mongoIndexesEnsured) return;
  const db = await getDb();

  await Promise.all([
    // users
    db.collection('users').createIndex({ username: 1 }, { unique: true, name: 'users_username_uq' }),
    db.collection('users').createIndex({ createdAt: -1 }, { name: 'users_created_desc' }),

    // sessions
    db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true, name: 'sessions_token_uq' }),
    db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'sessions_ttl' }),

    // progress
    db.collection('user_levels').createIndex({ userId: 1, slug: 1 }, { unique: true, name: 'levels_user_slug_uq' }),
    db.collection('user_levels').createIndex({ clearedAt: -1 }, { name: 'levels_clearedAt_desc' }),

    // files (Cloudinary public_id tracking)
    db.collection('files').createIndex({ userId: 1, type: 1, createdAt: -1 }, { name: 'files_user_type_created' }),
    db.collection('files').createIndex({ key: 1 }, { unique: true, name: 'files_key_uq' }),
  ]);

  g._mongoIndexesEnsured = true;
}
