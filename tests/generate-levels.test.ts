import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateLevels, levels } from '@/scripts/generate-levels.js';

describe('generate-levels script', () => {
  it('creates directories, level configs, and manifests for each definition', async () => {
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'anubis-levels-'));
    const levelsRoot = path.join(tmpRoot, 'levels');

    await generateLevels({ rootDir: levelsRoot });

    const createdSlugs = await fs.readdir(levelsRoot);
    expect(createdSlugs.sort()).toEqual(levels.map((lvl) => lvl.slug).sort());

    const sampleSlug = levels[0].slug;
    const cfg = JSON.parse(
      await fs.readFile(path.join(levelsRoot, sampleSlug, 'level.json'), 'utf8'),
    );
    expect(cfg).toMatchObject({
      slug: sampleSlug,
      mdx: 'prompt.mdx',
      hintsConsole: expect.any(Array),
      hintsSource: expect.any(Array),
    });
    expect(cfg.saltHex).toHaveLength(32);
    expect(cfg.userHashHex).toHaveLength(64);
    expect(cfg.passHashHex).toHaveLength(64);

    const manifest = await fs.readFile(
      path.join(levelsRoot, sampleSlug, 'assets', 'manifest.md'),
      'utf8',
    );
    expect(manifest).toContain('# Asset Manifest');
    expect(manifest).toContain('Credential outcome');
  });
});

