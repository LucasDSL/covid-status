import * as fs from 'fs';
import { join } from 'path';
export default async ({ filename, path }) =>
  new Promise((resolve, reject) => {
    let fileData;
    const fileReadStream = fs.createReadStream(join(path, filename), {
      encoding: 'utf-8',
    });

    fileReadStream.on('data', (chunk) => {
      fileData += chunk;
    });

    fileReadStream.on('end', () => resolve(fileData));

    fileReadStream.on('error', (error) => reject(error));
  });
