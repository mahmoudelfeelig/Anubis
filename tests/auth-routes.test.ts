import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  users: {
    findOne: vi.fn(),
    insertOne: vi.fn(),
  },
  hashPwd: vi.fn(),
  verifyPwd: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(async () => ({
    collection: (name: string) => {
      if (name !== 'users') throw new Error(`Unexpected collection: ${name}`);
      return mocks.users;
    },
  })),
}));

vi.mock('@/lib/auth', () => ({
  hashPwd: (...args: unknown[]) => mocks.hashPwd(...args),
  verifyPwd: (...args: unknown[]) => mocks.verifyPwd(...args),
}));

vi.mock('@/lib/session', () => ({
  createSession: (...args: unknown[]) => mocks.createSession(...args),
}));

function formRequest(path: string, fields: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value);
  }
  return new Request(`http://localhost${path}`, { method: 'POST', body });
}

beforeEach(() => {
  mocks.users.findOne.mockReset();
  mocks.users.insertOne.mockReset();
  mocks.hashPwd.mockReset();
  mocks.verifyPwd.mockReset();
  mocks.createSession.mockReset();
});

describe('signup route', () => {
  it('normalizes usernames before checking and creating users', async () => {
    const { POST } = await import('@/app/api/signup/route');
    mocks.users.findOne.mockResolvedValue(null);
    mocks.users.insertOne.mockResolvedValue({ acknowledged: true });
    mocks.hashPwd.mockResolvedValue('hash');
    mocks.createSession.mockResolvedValue(undefined);

    const response = await POST(formRequest('/api/signup', { username: '  User_Name  ', password: 'secret1' }));

    expect(response.status).toBe(200);
    expect(mocks.users.findOne).toHaveBeenCalledWith({ username: 'user_name' });
    expect(mocks.users.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'user_name', pwdHash: 'hash' }),
    );
    expect(mocks.createSession).toHaveBeenCalledTimes(1);
  });

  it('returns a conflict when a duplicate insert races the preflight check', async () => {
    const { POST } = await import('@/app/api/signup/route');
    mocks.users.findOne.mockResolvedValue(null);
    mocks.users.insertOne.mockRejectedValue({ code: 11000 });
    mocks.hashPwd.mockResolvedValue('hash');

    const response = await POST(formRequest('/api/signup', { username: 'taken', password: 'secret1' }));
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(409);
    expect(body.error).toBe('Username is already taken.');
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});

describe('login route', () => {
  it('normalizes usernames before lookup and creates a session after password verification', async () => {
    const { POST } = await import('@/app/api/login/route');
    mocks.users.findOne.mockResolvedValue({ _id: 'u-1', username: 'user-name', pwdHash: 'hash' });
    mocks.verifyPwd.mockResolvedValue(true);
    mocks.createSession.mockResolvedValue(undefined);

    const response = await POST(formRequest('/api/login', { username: ' User-Name ', password: 'secret1' }));

    expect(response.status).toBe(200);
    expect(mocks.users.findOne).toHaveBeenCalledWith({ username: 'user-name' });
    expect(mocks.verifyPwd).toHaveBeenCalledWith('secret1', 'hash');
    expect(mocks.createSession).toHaveBeenCalledWith('u-1');
  });

  it('rejects invalid login data without querying the database', async () => {
    const { POST } = await import('@/app/api/login/route');

    const response = await POST(formRequest('/api/login', { username: 'no spaces', password: 'secret1' }));

    expect(response.status).toBe(401);
    expect(mocks.users.findOne).not.toHaveBeenCalled();
  });
});
