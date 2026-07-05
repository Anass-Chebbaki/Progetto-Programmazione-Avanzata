/**
 * MOTORE DELLA MOSSA PvP
 * --------------------------
 * Verifica: ammisibilità, hit/miss mossa, registrazione, addebito token (o.015),
 * alternanza turno e rilevamento vittoria. tutto avviene tramite il lock sulla partita
 */

import DatabaseConnection from '../config/database';
import gameDAO from '../dao/GameDAO';
import moveDAO from '../dao/MoveDAO';
import userDAO from '../dao/UserDAO';
import Game from '../model/Game';
import { Board, isHit, totalShipCells } from '../utils/fleet';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

const MOVE_COST = 0.015;

export interface ExecuteMoveParams {
  gameId: number;
  userId: number;
  row: number;
  col: number;
}

export interface MoveOutcome {
  result: 'hit' | 'miss';
  game: Game;
}

class MoveService {
  public async executeMove(params: ExecuteMoveParams): Promise<MoveOutcome> {
    const { gameId, userId, row, col } = params;
    const sequelize = DatabaseConnection.getInstance().getSequelize();

    return sequelize.transaction(async (t) => {
      // Blocca la partita per l'intera mossa (niente race condizion tra mosse concorrenti).
      const game = await gameDAO.findByPk(gameId, { transaction: t, lock: true });
      if (game === null) {
        throw ErrorFactory.create(ErrorType.NotFound, 'Partita non trovata');
      }
      if (game.status !== 'in_progress') {
        throw ErrorFactory.create(ErrorType.Conflict, "La partita non e' in corso");
      }

      // Lato del giocatore e board avversaria (si spara sulla board dell'altro).
      let side: 'player1' | 'player2';
      let opponentBoard: Board;
      if (userId === game.player1Id) {
        side = 'player1';
        opponentBoard = game.boardPlayer2 as Board;
      } else if (userId === game.player2Id) {
        side = 'player2';
        opponentBoard = game.boardPlayer1 as Board;
      } else {
        throw ErrorFactory.create(ErrorType.Forbidden, 'Non partecipi a questa partita');
      }

      // E' il tuo turno?
      if (game.currentTurn !== side) {
        throw ErrorFactory.create(ErrorType.Conflict, "Non e' il tuo turno");
      }

      // Coordinate dentro la griglia.
      if (row < 0 || col < 0 || row >= game.gridSize || col >= game.gridSize) {
        throw ErrorFactory.create(ErrorType.BadRequest, 'Coordinate fuori dalla griglia');
      }

      // Colpo gia' effettuato su questa cella?
      const myMoves = await moveDAO.findByGameAndUser(gameId, userId, { transaction: t });
      if (myMoves.some((m) => m.row === row && m.col === col)) {
        throw ErrorFactory.create(ErrorType.Conflict, "Hai gia' colpito questa cella");
      }

      // Esito sulla board avversaria.
      const result: 'hit' | 'miss' = isHit(opponentBoard, row, col) ? 'hit' : 'miss';

      // Registra la mossa.
      await moveDAO.create({ gameId, userId, row, col, result }, { transaction: t });

      // Addebita 0.015 (puo' andare sotto zero: la partita continua; il blocco a
      // credito esaurito e' un middleware che vedo dopo come gestire).
      await userDAO.decrementTokens(userId, MOVE_COST, t);

      // Vittoria: tutte le celle delle navi avversarie sono state colpite.
      const hitsAfter = myMoves.filter((m) => m.result === 'hit').length + (result === 'hit' ? 1 : 0);
      if (hitsAfter === totalShipCells(opponentBoard)) {
        game.status = 'completed';
        game.winner = side;
        // a fine partita non si cambia turno
      } else {
        game.currentTurn = side === 'player1' ? 'player2' : 'player1';
      }
      await game.save({ transaction: t });

      return { result, game };
    });
  }
}

export default new MoveService();