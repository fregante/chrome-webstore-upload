import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const files = await readdir(directory, { recursive: true });
    const zip = new yazl.ZipFile();
    let hasManifest = false;

    for (const file of files) {
        if (isNotJunk(basename(file))) {
            zip.addFile(join(directory, file), file);
            hasManifest ||= file === 'manifest.json';
        }
    }

    if (!hasManifest) {
        throw new Error(`manifest.json was not found in ${directory}`);
    }

    zip.end();

    return zip.outputStream;
}

