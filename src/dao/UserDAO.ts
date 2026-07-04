import { FindOptions, Attributes, Transaction } from 'sequelize';
import User from '../model/User';
import { BaseDAO } from './BaseDAO';

export class UserDAO extends BaseDAO<User> {
  constructor() {
    super(User);
  }

  // Ricerca per email (auth e lookup avversario), con opzioni per transazione/lock.
  public async findByEmail(email: string, options?: Omit<FindOptions<Attributes<User>>, 'where'>): Promise<User | null> {
    return this.findOne({ email }, options);
  }

  // Addebito/accredito ATOMICO lato DB: tokens = tokens - amount (esatto sui DECIMAL).
  public async decrementTokens(userId: number, amount: number, transaction: Transaction): Promise<void> {
    await this.model.decrement('tokens', { by: amount, where: { id: userId }, transaction });
  }
}

export default new UserDAO();