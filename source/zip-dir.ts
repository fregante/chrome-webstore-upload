import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const entries = await readdir(directory, { recursive: true, withFileTypes: true });
    const files = entries
        .filter(entry => entry.isFile() && isNotJunk(entry.name))
        .map(entry => relative(directory, join(entry.parentPath, entry.name)));

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
