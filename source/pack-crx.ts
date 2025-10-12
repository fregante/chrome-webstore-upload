import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { basename } from 'node:path';

const execFileAsync = promisify(execFile);

export default async function packCRX(directory: string, privateKeyPath: string): Promise<string> {
    // Verify the directory exists
    const stats = await fs.promises.stat(directory);

    if (!stats.isDirectory()) {
        throw new Error(`${directory} is not a directory. When using packExtensionKey, only directories are accepted.`);
    }

    // Verify the key file exists
    await fs.promises.access(privateKeyPath, fs.constants.R_OK);

    // Determine the output CRX path (will be created by chrome in the parent directory)
    const directoryName = basename(directory.replace(/\/$/, ''));
    const parentDirectory = directory.replace(/\/?[^/]+\/?$/, '') || '.';
    const crxPath = `${parentDirectory}/${directoryName}.crx`;

    // Remove existing CRX if it exists
    try {
        await fs.promises.unlink(crxPath);
    } catch {
        // File doesn't exist, that's fine
    }

    // Pack the extension using Chrome
    const chromePath = 'google-chrome';

    try {
        await execFileAsync(chromePath, [
            '--pack-extension=' + directory,
            '--pack-extension-key=' + privateKeyPath,
        ]);
    } catch (error) {
        if (error instanceof TypeError) {
            throw new TypeError(`Failed to pack extension with Chrome: ${error.message}`);
        }

        throw error;
    }

    // Verify the CRX was created
    await fs.promises.access(crxPath, fs.constants.R_OK);

    return crxPath;
}
