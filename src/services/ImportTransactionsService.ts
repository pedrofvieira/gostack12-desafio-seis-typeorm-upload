import { Promise as PromiseHelper } from 'bluebird';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

import FileUtils from '../utils/fileUtils';

interface RequestImportTransationDTO {
  csvFileName: string;
}

interface RequestTransationDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({
    csvFileName,
  }: RequestImportTransationDTO): Promise<Transaction[]> {
    const fileUtils = new FileUtils();

    const checkFileExists = await fileUtils.checkFileExists(csvFileName);

    if (!checkFileExists) {
      throw new AppError('CSV File not found', 404);
    }

    const lines = await fileUtils.loadCSV(csvFileName);

    let transactionsCSV: RequestTransationDTO[] = lines.map(item => {
      return {
        title: item[0],
        type:
          item[1] === 'income' || item[1] === 'outcome' ? item[1] : 'income',
        value: Number(item[2]),
        category: item[3],
      };
    });

    transactionsCSV = transactionsCSV.sort(item => {
      if (item.type === 'income') {
        return 1;
      }

      return 2;
    });

    const createTransactionService = new CreateTransactionService();

    const transactions = await PromiseHelper.mapSeries(
      transactionsCSV,
      transactionData => createTransactionService.execute(transactionData),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
