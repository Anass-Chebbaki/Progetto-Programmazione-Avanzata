// Controller gioco

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import gameService from '../service/GameService';
import moveService from '../service/MoveService';
import { toPublicGame } from '../dto/gameDto';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

// Estrae e valida l'id partita dall'URL. Funzione di MODULO
// (i metodi del controller vengono passati staccati ad Express).
function parseGameId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw ErrorFactory.create(ErrorType.BadRequest, 'ID partita non valido');
  }
  return id;
}

class GameController {
  // POST /games —> crea una partita.
  public async create(req: Request, res: Response): Promise<void> {
    const { type, gridSize, ships, opponentEmail, silence } = req.body as {
      type: 'pvp' | 'pvai';
      gridSize: number;
      ships: number[];
      opponentEmail?: string;
      silence: number;
    };
    const creatorId = req.user!.id; // garantito dal middleware authenticate
    const game = await gameService.createGame({ creatorId, type, gridSize, ships, opponentEmail, silence });
    res.status(StatusCodes.CREATED).json({ game: toPublicGame(game) });
  }

  // POST /games/:id/moves —> esegue una mossa.
  public async move(req: Request, res: Response): Promise<void> {
    const gameId = parseGameId(req.params.id);
    const { row, col } = req.body as { row: number; col: number };
    const outcome = await moveService.executeMove({ gameId, userId: req.user!.id, row, col });
    // aiMove presente solo nel PvAI quando l'IA risponde (altrimenti omesso dal JSON).
    res.status(StatusCodes.OK).json({ result: outcome.result, aiMove: outcome.aiMove, game: toPublicGame(outcome.game) });
  }

  // POST /games/:id/silence —> il difensore arma il silenzio sul prossimo colpo subito.
  public async armSilence(req: Request, res: Response): Promise<void> {
    const gameId = parseGameId(req.params.id);
    const result = await gameService.armSilence(gameId, req.user!.id);
    res.status(StatusCodes.OK).json(result);
  }

  // GET /games/:id —> stato della partita per il richiedente.
  public async state(req: Request, res: Response): Promise<void> {
    const gameId = parseGameId(req.params.id);
    const s = await gameService.getGameState(gameId, req.user!.id);
    res.status(StatusCodes.OK).json({
      game: toPublicGame(s.game),
      you: s.side,
      yourTurn: s.yourTurn,
      myShots: s.myShots,
      shotsAgainstMe: s.shotsAgainstMe,
    });
  }
}

export default new GameController();