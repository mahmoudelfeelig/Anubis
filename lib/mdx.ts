import fs from 'node:fs/promises';
import path from 'node:path';
import { cache, type ReactElement } from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';

const LEVELS_ROOT = path.join(process.cwd(), 'levels');

export const loadLevelPrompt = cache(async (slug: string, fileName: string): Promise<ReactElement | null> => {
  try {
    const filePath = path.join(LEVELS_ROOT, slug, fileName);
    const source = await fs.readFile(filePath, 'utf8');
    const { content } = await compileMDX({
      source,
      options: {
        parseFrontmatter: false,
      },
    });
    return content;
  } catch (error) {
    console.error(`Failed to compile MDX for level ${slug}`, error);
    return null;
  }
});
