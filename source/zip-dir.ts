import { readdir, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const files = await readdir(directory, { recursive: true });
    const zip = new yazl.ZipFile();
    let hasManifest = false;

    for (const file of files) {
        if (typeof file !== 'string') {
            continue;
        }

        const fullPath = join(directory, file);
        // eslint-disable-next-line no-await-in-loop
        const stats = await stat(fullPath);

        if (stats.isFile() && isNotJunk(basename(file))) {
            zip.addFile(fullPath, file);
            hasManifest ||= file === 'manifest.json';
        }
    }

    if (!hasManifest) {
        throw new Error(`manifest.json was not found in ${directory}`);
    }

    zip.end();

    return zip.outputStream;
}

