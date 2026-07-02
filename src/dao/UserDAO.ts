
import User from '../model/User';
import { BaseDAO } from './BaseDAO';

// eredita il CRUD e aggiunge finder specifici del dominio.
export class UserDAO extends BaseDAO<User> {
  constructor() {
    super(User);
  }

  // Ricerca per email (verrà usata in fase di autenticazione)
  public async findByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ where: { email } });
  }
}

// Istanza singola (riutilizzabile)
export default new UserDAO();