import { ObjectId } from 'mongodb';

/** Return ObjectId if input looks like 24-hex, else keep string UUID. */
export function toUserId(id: string) {
  return /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : id;
}
