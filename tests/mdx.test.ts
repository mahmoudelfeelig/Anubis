import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

async function withTempLevels<T>(fn: (_directory: string) => Promise<T>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anubis-mdx-'));
  try {
    await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

describe('loadLevelPrompt', () => {
  it('compiles mdx content to a React element', async () => {
    await withTempLevels(async (tmp) => {
      const levelsRoot = path.join(tmp, 'levels', 'lv-mdx');
      await fs.mkdir(levelsRoot, { recursive: true });
      await fs.writeFile(path.join(levelsRoot, 'prompt.mdx'), '# Hello **MDX**!');

      vi.resetModules();
      const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
      const { loadLevelPrompt } = await import('@/lib/mdx');

      const element = await loadLevelPrompt('lv-mdx', 'prompt.mdx');
      expect(element).not.toBeNull();
      expect(renderToStaticMarkup(element!)).toContain('<h1>Hello <strong>MDX</strong>!</h1>');

      cwdSpy.mockRestore();
    });
  });

  it('returns null and logs when file cannot be read', async () => {
    await withTempLevels(async (tmp) => {
      vi.resetModules();
      const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tmp);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { loadLevelPrompt } = await import('@/lib/mdx');

      const element = await loadLevelPrompt('missing', 'prompt.mdx');
      expect(element).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      cwdSpy.mockRestore();
    });
  });
});

