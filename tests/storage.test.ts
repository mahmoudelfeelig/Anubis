import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { resolvePath } from '@/lib/storage';

describe('resolvePath', () => {
  it('resolves paths inside the public directory', () => {
    const resolved = resolvePath(['levels', 'example.png']);
    expect(resolved).toBe(path.join(process.cwd(), 'public', 'levels', 'example.png'));
  });

  it('guards against directory traversal', () => {
    expect(() => resolvePath(['..', 'etc', 'passwd'])).toThrowError('Invalid path');
  });
});

