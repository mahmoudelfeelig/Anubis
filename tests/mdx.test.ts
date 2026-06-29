import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

describe('loadLevelPrompt', () => {
  it('renders compiled MDX content for a known level', async () => {
    vi.resetModules();
    const { loadLevelPrompt } = await import('@/lib/mdx');

    const element = await loadLevelPrompt('lv-001', 'prompt.mdx');
    expect(element).not.toBeNull();
    expect(renderToStaticMarkup(element!)).toContain('WELF-6');
  });

  it('returns null when the prompt is missing', async () => {
    vi.resetModules();
    const { loadLevelPrompt } = await import('@/lib/mdx');

    const element = await loadLevelPrompt('missing', 'prompt.mdx');
    expect(element).toBeNull();
  });
});
