import crypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionUser = vi.fn();
const getLevel = vi.fn();
const markCleared = vi.fn();

vi.mock('@/lib/session', () => ({ getSessionUser }));
vi.mock('@/lib/levels', () => ({ getLevel }));
vi.mock('@/lib/progress', () => ({ markCleared }));
vi.mock('@/lib/normalize', async () => {
  const actual = await vi.importActual<typeof import('@/lib/normalize')>('@/lib/normalize');
  return actual;
});

beforeEach(() => {
  getSessionUser.mockReset();
  getLevel.mockReset();
  markCleared.mockReset();
});

async function loadSolveForm() {
  vi.resetModules();
  return (await import('@/app/(anubis)/level/[slug]/actions')).solveForm;
}

describe('solveForm', () => {
  it('rejects when no session user present', async () => {
    getSessionUser.mockResolvedValue(null);
    const solveForm = await loadSolveForm();

    await expect(solveForm('lv-001', 'user', 'pass')).resolves.toEqual({ ok: false, msg: 'auth' });
  });

  it('rejects when level is not a form mode', async () => {
    getSessionUser.mockResolvedValue({ id: 'u1', username: 'alpha' });
    getLevel.mockResolvedValue({ mode: 'url' });
    const solveForm = await loadSolveForm();

    await expect(solveForm('lv-001', 'user', 'pass')).resolves.toEqual({ ok: false, msg: 'mode' });
  });

  it('returns ok false when hashes do not match', async () => {
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    const hash = crypto.scryptSync('correctuser', salt, 32).toString('hex');
    const passHash = crypto.scryptSync('correctpass', salt, 32).toString('hex');

    getSessionUser.mockResolvedValue({ id: 'u1', username: 'alpha' });
    getLevel.mockResolvedValue({
      mode: 'form',
      saltHex,
      userHashHex: hash,
      passHashHex: passHash,
    });

    const solveForm = await loadSolveForm();

    const result = await solveForm('lv-001', 'wrong', 'also-wrong');
    expect(result).toEqual({ ok: false });
    expect(markCleared).not.toHaveBeenCalled();
  });

  it('marks progress when hashes match normalized input', async () => {
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    const normalize = (await import('@/lib/normalize')).normalize;
    const userHashHex = crypto.scryptSync(normalize('Stack Zero'), salt, 32).toString('hex');
    const passHashHex = crypto.scryptSync(normalize('Hollow Port'), salt, 32).toString('hex');

    getSessionUser.mockResolvedValue({ id: 'u42', username: 'tester' });
    getLevel.mockResolvedValue({
      mode: 'form',
      saltHex,
      userHashHex,
      passHashHex,
    });

    const solveForm = await loadSolveForm();
    const result = await solveForm('lv-001', 'Stack Zero', 'Hollow Port');

    expect(result).toEqual({ ok: true });
    expect(markCleared).toHaveBeenCalledWith('u42', 'lv-001');
  });
});
