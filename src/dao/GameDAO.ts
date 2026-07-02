import { Op } from 'sequelize';
import Game from '../model/Game';
import { BaseDAO } from './BaseDAO';

export class GameDAO extends BaseDAO<Game> {
  constructor() {
    super(Game);
  }

  // Partita "in corso" in cui l'utente e' player1 OPPURE player2.
  // Primitiva per il vincolo "una sola partita attiva per utente".
  public async findActiveGameForUser(userId: number): Promise<Game | null> {
    return this.model.findOne({
      where: {
        status: 'in_progress',
        [Op.or]: [{ player1Id: userId }, { player2Id: userId }],//[Op.or] per cercare l'utente sia come p1 sia come p2
      },
    });
  }
}

export default new GameDAO();