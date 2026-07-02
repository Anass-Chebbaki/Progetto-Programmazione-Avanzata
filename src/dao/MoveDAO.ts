import Move from '../model/Move';
import { BaseDAO } from './BaseDAO';

export class MoveDAO extends BaseDAO<Move> {
  constructor() {
    super(Move);
  }

  // Mosse di una partita in ordine cronologico (turno, vittoria, log CSV)
  public async findByGame(gameId: number): Promise<Move[]> {
    return this.model.findAll({ where: { gameId }, order: [['createdAt', 'ASC']] });
  }

  // Conteggio mosse di una partita (addebito/turno)
  public async countByGame(gameId: number): Promise<number> {
    return this.model.count({ where: { gameId } });
  }
}

export default new MoveDAO();