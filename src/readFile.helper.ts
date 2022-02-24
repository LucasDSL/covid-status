import * as fs from 'fs';
export default async (filePath) =>
  new Promise((resolve, reject) => {
    let fileData = '';
    const fileReadStream = fs
      .createReadStream(filePath, {
        encoding: 'utf-8',
      })
      .on('data', (chunk) => {
        fileData += chunk;
      })
      .on('end', () => resolve(fileData))
      .on('error', (error) => reject(error));
  });
