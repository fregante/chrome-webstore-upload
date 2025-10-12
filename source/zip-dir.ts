import { readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';

async function * getFiles(directory: string): AsyncGenerator<string> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            yield * getFiles(fullPath);
        } else {
            yield fullPath;
        }
    }
}

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const zip = new yazl.ZipFile();
    let hasManifest = false;

    for await (const file of getFiles(directory)) {
        if (isNotJunk(basename(file))) {
            const relativePath = relative(directory, file);
            zip.addFile(file, relativePath);
            hasManifest ||= relativePath === 'manifest.json';
        }
    }

    if (!hasManifest) {
        throw new Error(`manifest.json was not found in ${directory}`);
    }

    zip.end();

    return zip.outputStream;
}

