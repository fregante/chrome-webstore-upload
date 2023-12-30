import { open } from 'node:fs/promises';

const manifestFile = await open('./live-test/manifest.json', 'r+');

const manifest = JSON.parse(await manifestFile.readFile('utf8'));
const parts = manifest.version.split('.');
parts[2] = Number(parts[2]) + 1;
manifest.version = parts.join('.');
await manifestFile.write(JSON.stringify(manifest, null, '\t'), 0);

manifestFile.close();
