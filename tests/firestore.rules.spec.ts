import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const emu = process.env.FIRESTORE_EMULATOR_HOST ?? '';
const hasEmu = emu.length > 0;

function parseHostPort(): { readonly host: string; readonly port: number } {
  const parts = emu.split(':');
  const host = parts[0] ?? '127.0.0.1';
  const port = Number(parts[1] ?? '8080');
  return { host, port };
}

describe.skipIf(!hasEmu)('firestore rules contentPacks', () => {
  let env: RulesTestEnvironment;
  const { host, port } = parseHostPort();

  beforeAll(async () => {
    const rulesPath = join(process.cwd(), 'firestore.rules');
    const rules = readFileSync(rulesPath, 'utf8');
    env = await initializeTestEnvironment({
      projectId: 'epa-rules-test',
      firestore: { rules, host, port },
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('allows get published pack', async () => {
    const ctx = env.unauthenticatedContext();
    const db = ctx.firestore();
    await env.withSecurityRulesDisabled(async (ctx2) => {
      const adb = ctx2.firestore();
      await setDoc(doc(adb, 'contentPacks/india-lok-sabha-published'), { v: 1 });
    });
    await assertSucceeds(getDoc(doc(db, 'contentPacks/india-lok-sabha-published')));
  });
  it('denies get other pack id', async () => {
    const ctx = env.unauthenticatedContext();
    const db = ctx.firestore();
    await env.withSecurityRulesDisabled(async (ctx2) => {
      const adb = ctx2.firestore();
      await setDoc(doc(adb, 'contentPacks/secret'), { v: 1 });
    });
    await assertFails(getDoc(doc(db, 'contentPacks/secret')));
  });
  it('denies list collection', async () => {
    const ctx = env.unauthenticatedContext();
    const db = ctx.firestore();
    await assertFails(getDocs(collection(db, 'contentPacks')));
  });
  it('denies write published pack from client', async () => {
    const ctx = env.unauthenticatedContext();
    const db = ctx.firestore();
    await assertFails(setDoc(doc(db, 'contentPacks/india-lok-sabha-published'), { hacked: true }));
  });
  it('denies random collection read', async () => {
    const ctx = env.unauthenticatedContext();
    const db = ctx.firestore();
    await env.withSecurityRulesDisabled(async (ctx2) => {
      await setDoc(doc(ctx2.firestore(), 'other/doc'), { x: 1 });
    });
    await assertFails(getDoc(doc(db, 'other/doc')));
  });
});
