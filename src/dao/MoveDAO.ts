import { FindOptions, Attributes } from 'sequelize';
import Move from '../model/Move';
import { BaseDAO } from './BaseDAO';

export class MoveDAO extends BaseDAO<Move> {
  constructor() {
    super(Move);
  }

  // Mosse di una partita in ordine cronologico (storico CSV)
  public async findByGame(gameId: number): Promise<Move[]> {
    return this.model.findAll({ where: { gameId }, order: [['createdAt', 'ASC']] });
  }

  // Conteggio mosse di una partita.
  public async countByGame(gameId: number): Promise<number> {
    return this.model.count({ where: { gameId } });
  }

  // Mosse di un dato giocatore in una partita: per rilevare colpi duplicati e contare gli hit.
  public async findByGameAndUser(
    gameId: number,
    userId: number,
    options?: Omit<FindOptions<Attributes<Move>>, 'where'>,
  ): Promise<Move[]> {
    return this.model.findAll({ where: { gameId, userId }, ...options });
  }

  // Mosse dell'IA in una partita (userId IS NULL): per evitare ripetizioni e contare gli hit.
  public async findAiMoves(
    gameId: number,
    options?: Omit<FindOptions<Attributes<Move>>, 'where'>,
  ): Promise<Move[]> {
    return this.model.findAll({ where: { gameId, userId: null }, ...options }); //null quindi Ai (non utnte)
  }
}

export default new MoveDAO();