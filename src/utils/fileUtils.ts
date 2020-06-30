import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import AppError from '../errors/AppError';

import uploadConfig from '../config/upload';

class FileUtils {
  async checkFileExists(csvFileName: string): Promise<boolean> {
    const csvFilePath = path.join(uploadConfig.directory, csvFileName);
    const csvFileExists = await fs.promises.stat(csvFilePath);

    return !!csvFileExists;
  }

  async loadCSV(csvFileName: string): Promise<any[]> {
    try {
      const csvFilePath = path.join(uploadConfig.directory, csvFileName);
      const readCSVStream = fs.createReadStream(csvFilePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: any[] = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    } catch (error) {
      throw new AppError("Couldn't import CSV file", 400);
    }
  }
}

export default FileUtils;
