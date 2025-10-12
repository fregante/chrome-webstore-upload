import { Readable } from 'node:stream';
import { test, expect } from 'vitest';
import zipStreamFromDirectory from '../source/zip-dir.js';

test('Rejects when provided invalid directory', async () => {
    await expect(zipStreamFromDirectory('non-existent-dir')).rejects.toThrow();
});

test('Rejects when manifest.json is not found', async () => {
    await expect(zipStreamFromDirectory('./test/fixtures')).rejects.toThrow('manifest.json was not found');
});

test('Returns a readable stream for valid extension directory', async () => {
    const stream = await zipStreamFromDirectory('./test/fixtures/valid-extension');
    expect(stream).toBeInstanceOf(Readable);
});

test('Can accept test/extension directory', async () => {
    const stream = await zipStreamFromDirectory('./test/extension');
    expect(stream).toBeInstanceOf(Readable);
});
