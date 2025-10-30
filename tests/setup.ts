import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/anubis-test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'test-session-secret';
process.env.PWD_PEPPER = process.env.PWD_PEPPER ?? 'test-pepper';
process.env.CLD_CLOUD_NAME = process.env.CLD_CLOUD_NAME ?? 'demo-cloud';
process.env.CLD_API_KEY = process.env.CLD_API_KEY ?? 'demo-key';
process.env.CLD_API_SECRET = process.env.CLD_API_SECRET ?? 'demo-secret';
process.env.VITE_CJS_IGNORE_WARNING = process.env.VITE_CJS_IGNORE_WARNING ?? 'true';

afterEach(() => {
  vi.restoreAllMocks();
});
