import type { Db } from "mongodb";

type G = typeof globalThis & {
  __mongoClient?: any;               // MongoClient
  __mongoIndexesEnsured?: boolean;
};

async function ensureIndexes(db: Db) {
  await Promise.all([
    // users
    db.collection("users").createIndex({ username: 1 }, { unique: true, name: "users_username_uq" }),

    // sessions
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true, name: "sessions_token_uq" }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "sessions_ttl" }),

    // progress
    db.collection("user_levels").createIndex({ userId: 1, slug: 1 }, { unique: true, name: "levels_user_slug_uq" }),
    db.collection("user_levels").createIndex({ clearedAt: -1 }, { name: "levels_clearedAt_desc" }),

    // files (Cloudinary public_id tracking)
    db.collection("files").createIndex({ userId: 1, type: 1, createdAt: -1 }, { name: "files_user_type_created" }),
    db.collection("files").createIndex({ key: 1 }, { unique: true, name: "files_key_uq" }),
  ]);
}

export async function getDb(dbName = "anubis"): Promise<Db> {
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error("MONGODB_URI missing");

  const g = globalThis as G;

  // Defer loading the driver so it only runs under nodejs runtime
  const { MongoClient, ServerApiVersion } = await import("mongodb");

  if (!g.__mongoClient) {
    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    g.__mongoClient = client;
    g.__mongoIndexesEnsured = false;
  }

  const db = (g.__mongoClient as InstanceType<typeof MongoClient>).db(dbName);

  if (!g.__mongoIndexesEnsured) {
    await ensureIndexes(db);
    g.__mongoIndexesEnsured = true;
  }

  return db;
}
