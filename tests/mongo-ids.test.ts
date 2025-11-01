import { describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { toUserId } from '@/lib/mongo-ids';

describe('toUserId', () => {
  it('returns ObjectId for 24 character hex strings', () => {
    const input = '507f1f77bcf86cd799439011';
    const result = toUserId(input);
    expect(result).toBeInstanceOf(ObjectId);
    expect((result as ObjectId).toHexString()).toBe(input);
  });

  it('returns original value when not a hex ObjectId', () => {
    const input = 'user-123';
    expect(toUserId(input)).toBe(input);
  });
});
