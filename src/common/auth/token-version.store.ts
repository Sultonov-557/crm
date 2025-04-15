import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const FILE_PATH = join(__dirname, './token-version.json');

let cache: Record<string, string> | null = null;

function loadTokenVersions(): Record<string, string> {
  if (cache) return cache;
  if (!existsSync(FILE_PATH)) return {};
  const raw = readFileSync(FILE_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

export function getTokenVersion(userId: string): string {
  const store = loadTokenVersions();
  return store[userId] ?? randomUUID();
}

export function incrementTokenVersion(userId: string): string {
  const store = loadTokenVersions();
  const updated = randomUUID();
  store[userId] = updated;
  cache = store;
  writeFileSync(FILE_PATH, JSON.stringify(store, null, 2));
  return updated;
}
