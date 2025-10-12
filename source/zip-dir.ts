import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const allFiles = await readdir(directory, { recursive: true });
    const files = allFiles.filter(file => isNotJunk(basename(file)));

    if (!files.includes('manifest.json')) {
        throw new Error(`manifest.json was not found in ${directory}`);
    }

    const zip = new yazl.ZipFile();

    for (const file of files) {
        zip.addFile(join(directory, file), file);
    }

    zip.end();

    return zip.outputStream;
}

