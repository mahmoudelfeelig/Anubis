import path from 'node:path';
import fs from 'node:fs/promises';
import { compileMDX } from 'next-mdx-remote/rsc';
import { createElement, type ComponentType, type ReactElement } from 'react';

type MdxModule = { default?: ComponentType } | ComponentType;

export async function compileFromFilesystem(slug: string, fileName: string): Promise<ReactElement | null> {
  try {
    const filePath = path.join(process.cwd(), 'levels', slug, fileName);
    const source = await fs.readFile(filePath, 'utf8');
    const { content } = await compileMDX({
      source,
      options: { parseFrontmatter: false },
    });
    return content;
  } catch (error) {
    console.error(`Failed to compile MDX for level ${slug}`, error);
    return null;
  }
}

export async function loadMdxModule(slug: string, fileName: string): Promise<ReactElement | null> {
  try {
    const mod = (await import(`../levels/${slug}/${fileName}`)) as MdxModule;
    const Component = (mod as { default?: ComponentType }).default ?? (mod as ComponentType);
    return Component ? createElement(Component) : null;
  } catch {
    return compileFromFilesystem(slug, fileName);
  }
}
