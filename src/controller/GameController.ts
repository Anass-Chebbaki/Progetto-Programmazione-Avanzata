// Controller della creazione partita: adatta HTTP <-> GameService, senza logica ne' DB.

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import gameService from '../service/GameService';
import moveService from '../service/MoveService';
import { toPublicGame } from '../dto/gameDto';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

class GameController {
  // POST /games —> crea una partita.
  public async create(req: Request, res: Response): Promise<void> {
    const { type, gridSize, ships, opponentEmail } = req.body as {
      type: 'pvp' | 'pvai';
      gridSize: number;
      ships: number[];
      opponentEmail?: string;
    };
    const creatorId = req.user!.id; // garantito dal middleware authenticate
    const game = await gameService.createGame({ creatorId, type, gridSize, ships, opponentEmail });
    res.status(StatusCodes.CREATED).json({ game: toPublicGame(game) });
  }

  // POST /games/:id/moves —> esegue una mossa.
  public async move(req: Request, res: Response): Promise<void> {
    const gameId = Number(req.params.id);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      throw ErrorFactory.create(ErrorType.BadRequest, 'ID partita non valido');
    }
    const { row, col } = req.body as { row: number; col: number };
    const userId = req.user!.id;
    const outcome = await moveService.executeMove({ gameId, userId, row, col });
    res.status(StatusCodes.OK).json({ result: outcome.result, game: toPublicGame(outcome.game) });
  }
}

export default new GameController();