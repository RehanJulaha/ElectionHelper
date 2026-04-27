import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function collectObjectKeyPaths(value: unknown, prefix = ''): ReadonlySet<string> {
  const paths = new Set<string>();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return paths;
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const path = prefix ? `${prefix}.${key}` : key;
    paths.add(path);
    const child = record[key];
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      for (const nested of collectObjectKeyPaths(child, path)) {
        paths.add(nested);
      }
    }
  }
  return paths;
}

describe('i18n translation key parity', () => {
  it('en.json and hi.json define the same dot-notation key paths for nested objects', () => {
    const dir = join(process.cwd(), 'src', 'assets', 'i18n');
    const en = JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8')) as unknown;
    const hi = JSON.parse(readFileSync(join(dir, 'hi.json'), 'utf8')) as unknown;
    const enPaths = collectObjectKeyPaths(en);
    const hiPaths = collectObjectKeyPaths(hi);
    const onlyEn = [...enPaths].filter((k) => !hiPaths.has(k)).sort();
    const onlyHi = [...hiPaths].filter((k) => !enPaths.has(k)).sort();
    expect(onlyEn).toEqual([]);
    expect(onlyHi).toEqual([]);
  });
});
