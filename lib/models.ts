import type { ObjectId } from 'mongodb';

export interface UserDoc {
  _id: string | ObjectId;
  username: string;
  pwdHash: string;
  pfp?: string;
  createdAt?: Date;
}

export interface UserLevelDoc {
  userId: string | ObjectId;
  slug: string;
  clearedAt: Date;
}

export interface SessionDoc {
  tokenHash: string;
  userId: string | ObjectId;
  expiresAt: Date;
}

export interface FileDoc {
  _id?: any;
  userId: string;         // or ObjectId
  key: string;            // Cloudinary public_id
  url: string;            // can be empty; we build at runtime
  size: number;
  type: 'avatar'|'other';
  createdAt: Date;
}