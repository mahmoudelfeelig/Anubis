import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/elfeel-archive-test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? 'test-session-secret';
process.env.PWD_PEPPER = process.env.PWD_PEPPER ?? 'test-pepper';
process.env.VITE_CJS_IGNORE_WARNING = process.env.VITE_CJS_IGNORE_WARNING ?? 'true';

afterEach(() => {
  vi.restoreAllMocks();
});
