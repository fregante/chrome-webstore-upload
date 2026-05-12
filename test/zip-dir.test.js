import { Buffer } from 'node:buffer';
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

test('Produces a complete zip stream for an extension with subdirectories', async () => {
    const stream = await zipStreamFromDirectory('./test/fixtures/valid-extension');
    const chunks = [];
    await new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', resolve);
        stream.on('error', reject);
    });
    expect(Buffer.concat(chunks).length).toBeGreaterThan(0);
});

test('Can accept test/extension directory', async () => {
    const stream = await zipStreamFromDirectory('./test/extension');
    expect(stream).toBeInstanceOf(Readable);
});
