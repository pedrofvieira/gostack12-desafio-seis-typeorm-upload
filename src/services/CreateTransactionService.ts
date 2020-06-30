import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestTransationDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestTransationDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const newTransaction = {
      title,
      value,
      type,
      category_id: '',
    };

    if (newTransaction.type === 'outcome') {
      const {
        total: totalAvailable,
      } = await transactionsRepository.getBalance();

      if (newTransaction.value > totalAvailable) {
        throw new AppError(
          'There is no balance available for this transaction',
          400,
        );
      }
    }
    const categoriesRepository = getRepository(Category);

    const existentCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (existentCategory) {
      newTransaction.category_id = existentCategory.id;
    } else {
      const newCategoryItem = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategoryItem);
      newTransaction.category_id = newCategoryItem.id;
    }

    const transaction = transactionsRepository.create(newTransaction);

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
