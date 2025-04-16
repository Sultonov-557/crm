import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const FILE_PATH = join(__dirname, './refresh-token-version.json');

let cache: Record<string, string> | null = null;

function loadRefreshTokenVersions(): Record<string, string> {
  if (cache) return cache;
  if (!existsSync(FILE_PATH)) return {};
  const raw = readFileSync(FILE_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

export function getRefreshTokenVersion(userId: string): string {
  const store = loadRefreshTokenVersions();
  return store[userId] ?? randomUUID();
}

export function incrementRefreshTokenVersion(userId: string): string {
  const store = loadRefreshTokenVersions();
  const updated = randomUUID();
  store[userId] = updated;
  cache = store;
  writeFileSync(FILE_PATH, JSON.stringify(store, null, 2));
  return updated;
}
