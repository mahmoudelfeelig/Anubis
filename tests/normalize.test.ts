import { describe, expect, it } from 'vitest';
import { normalize } from '@/lib/normalize';

describe('normalize', () => {
  it('lowercases, strips diacritics, and keeps alphanumerics', () => {
    expect(normalize('Écho-Rift 123!')).toBe('echorift123');
  });

  it('returns empty string when all characters are removed', () => {
    expect(normalize('!!!')).toBe('');
  });
});

