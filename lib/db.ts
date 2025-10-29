import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('MONGODB_URI missing');

let client: MongoClient;
let db: Db;

declare global { var _mongo: { client: MongoClient, db: Db } | undefined }
if (!global._mongo) {
  client = new MongoClient(uri);
  db = client.db();
  global._mongo = { client, db };
}

export async function getDb() {
  if (!global._mongo) throw new Error('mongo not init');
  // Ensure connected
  await global._mongo.client.db().command({ ping: 1 });
  return global._mongo.db;
}
