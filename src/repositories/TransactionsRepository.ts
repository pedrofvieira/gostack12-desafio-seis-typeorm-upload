import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const somaIn = transactions.reduce((total, next) => {
      return next.type === 'income' ? total + Number(next.value) : total;
    }, 0);

    const somaOut = transactions.reduce((total, next) => {
      return next.type === 'outcome' ? total + Number(next.value) : total;
    }, 0);

    const balance = {
      income: somaIn,
      outcome: somaOut,
      total: somaIn - somaOut,
    };
    return balance;
  }
}

export default TransactionsRepository;
