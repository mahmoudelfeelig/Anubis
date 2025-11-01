export type LevelMode = 'form' | 'url';
export type LevelKind = 'mdx'|'image'|'audio'|'custom';

export interface LevelConfig {
  slug: string;
  number: number;
  title: string;
  mode: LevelMode;
  kind: LevelKind;
  mdx?: string;
  asset?: string;
  audio?: string;
  saltHex?: string;
  userHashHex?: string;
  passHashHex?: string;
  hintsConsole?: string[];
  hintsSource?: string[];
  theme?: { className?: string; cssVars?: Record<string,string>; bgImage?: string };
}

export interface UserDoc extends Record<string, unknown> {
  _id: string;
  username: string;
  pwdHash: string;
  createdAt: Date;
  pfp?: string | null;
}

export interface SessionDoc extends Record<string, unknown> {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface UserLevelDoc extends Record<string, unknown> {
  userId: string;
  slug: string;
  clearedAt: Date;
}
