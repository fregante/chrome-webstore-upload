import { basename, relative } from 'node:path';
import { isNotJunk } from 'junk';
import yazl from 'yazl';
import recursiveDir from 'recursive-readdir';

export default async function zipStreamFromDirectory(directory: string): Promise<NodeJS.ReadableStream> {
    const files = await recursiveDir(directory);
    const zip = new yazl.ZipFile();
    let hasManifest = false;

    for (const file of files) {
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

