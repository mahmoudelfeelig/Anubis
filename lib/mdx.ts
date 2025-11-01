import { cache, type ReactElement } from 'react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { compileMDX } from 'next-mdx-remote/rsc';

export const loadLevelPrompt = cache(async (slug: string, fileName: string): Promise<ReactElement | null> => {
  try {
    const full = path.join(process.cwd(), 'levels', slug, fileName);
    const source = await fs.readFile(full, 'utf8');
    const { content } = await compileMDX({ source, options: { parseFrontmatter: false } });
    return content;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to compile MDX for level ${slug}/${fileName}`);
    }
    return null;
  }
});
