export const USERNAME_PATTERN = /^[a-z0-9_-]{3,24}$/;

export function normalizeUsernameInput(value: FormDataEntryValue | null) {
  return String(value ?? '').trim().toLowerCase();
}

export function readPasswordInput(value: FormDataEntryValue | null) {
  return String(value ?? '');
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value);
}
