// Logica amministrativa: ricarica del credito di un utente (solo da parte di admin).
// SET: il credito viene IMPOSTATO al nuovo valore fornito (non ADD)

import DatabaseConnection from '../config/database';
import userDAO from '../dao/UserDAO';
import User from '../model/User';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

class AdminService {
  public async recharge(email: string, tokens: number): Promise<User> {
    const sequelize = DatabaseConnection.getInstance().getSequelize();
    return sequelize.transaction(async (t) => {
      // Lock sulla riga: evita corse con eventuali addebiti in corso.
      const user = await userDAO.findByEmail(email, { transaction: t, lock: true });
      if (user === null) {
        throw ErrorFactory.create(ErrorType.NotFound, 'Utente non trovato');
      }
      user.tokens = tokens; // SET al nuovo valore
      await user.save({ transaction: t });
      return user;
    });
  }
}

export default new AdminService();