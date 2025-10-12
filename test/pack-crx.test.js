import fs from 'node:fs';
import { test, expect } from 'vitest';
import packCRX from '../source/pack-crx.js';

const cleanupCrx = async () => {
    // Clean up any generated CRX files
    try {
        await fs.promises.unlink('./test/fixtures/valid-extension.crx');
    } catch {
        // File doesn't exist, that's fine
    }
};

test('Rejects when provided non-directory path', async () => {
    await expect(packCRX('./test/fixtures/test.crx', './test/fixtures/valid-extension.pem'))
        .rejects.toThrow('is not a directory');
});

test('Rejects when key file does not exist', async () => {
    await expect(packCRX('./test/fixtures/valid-extension', './non-existent.pem'))
        .rejects.toThrow();
});

test('Packs extension directory with private key', async () => {
    await cleanupCrx();

    const crxPath = await packCRX('./test/fixtures/valid-extension', './test/fixtures/valid-extension.pem');

    expect(crxPath).toBe('./test/fixtures/valid-extension.crx');

    // Verify the file was created
    const stats = await fs.promises.stat(crxPath);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);

    await cleanupCrx();
});

test('Overwrites existing CRX file', async () => {
    await cleanupCrx();

    // Create the CRX twice to ensure it overwrites
    const crxPath1 = await packCRX('./test/fixtures/valid-extension', './test/fixtures/valid-extension.pem');

    const crxPath2 = await packCRX('./test/fixtures/valid-extension', './test/fixtures/valid-extension.pem');
    const stats2 = await fs.promises.stat(crxPath2);

    expect(crxPath1).toBe(crxPath2);
    expect(stats2.isFile()).toBe(true);

    await cleanupCrx();
});

