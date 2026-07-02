// @vitest-environment jsdom

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const solveForm = vi.fn();

vi.mock('@/app/(anubis)/level/[slug]/actions', () => ({
  solveForm: (...args: unknown[]) => solveForm(...args),
}));

const mockPlay = vi.fn(() => Promise.resolve());
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' } as Location,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

beforeEach(() => {
  solveForm.mockReset();
  mockPlay.mockClear();
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(mockPlay as any);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  window.location.href = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

type LevelOverride = Partial<{
  slug: string;
  number: number;
  title: string;
  asset?: string;
  audio?: string;
  hintsConsole?: string[];
  hintsSource?: string[];
  theme?: { className?: string; cssVars?: Record<string, string> };
  next?: string | null;
}>;

async function renderRunner(overrides: LevelOverride = {}) {
  const LevelRunner = (await import('@/components/LevelRunner')).default;
  const level = {
    slug: 'lv-001',
    number: 1,
    title: 'Margin Discipline',
    asset: 'assets/one.png',
    audio: undefined,
    hintsConsole: ['hint-one'],
    hintsSource: ['source-hint'],
    theme: { className: 'theme', cssVars: { '--accent': '#fff' } },
    next: null,
  };
  return render(<LevelRunner level={{ ...level, ...overrides }} />);
}

describe('LevelRunner', () => {
  it('renders image and audio elements with expected attributes', async () => {
    const { container } = await renderRunner();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/levels/lv-001/assets/one.png');

    const audio = container.querySelector('audio') as HTMLAudioElement;
    expect(audio).not.toBeNull();
    expect(audio.getAttribute('src')).toBe('/media/ambient-tape.mp3');
    expect(mockPlay).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /audio/i })).not.toBeInTheDocument();
  });

  it('submits credentials and surfaces success message', async () => {
    solveForm.mockResolvedValue({ ok: true });
    const { container } = await renderRunner({ next: 'lv-002' });

    const details = container.querySelector('details');
    if (details) details.open = true;

    await userEvent.type(screen.getByPlaceholderText('first answer'), 'User');
    await userEvent.type(screen.getByPlaceholderText('second answer'), 'Pass');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(solveForm).toHaveBeenCalledWith('lv-001', 'User', 'Pass');
    expect(await screen.findByText('Accepted.')).toBeInTheDocument();
    expect(window.location.href).toContain('/level/lv-002');
  });

  it('shows retry message when solveForm fails', async () => {
    solveForm.mockResolvedValue({ ok: false });
    const { container } = await renderRunner();

    const details = container.querySelector('details');
    if (details) details.open = true;

    await userEvent.type(screen.getByPlaceholderText('first answer'), 'User');
    await userEvent.type(screen.getByPlaceholderText('second answer'), 'Pass');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Not quite.')).toBeInTheDocument();
    expect(window.location.href).toBe('');
  });
});
