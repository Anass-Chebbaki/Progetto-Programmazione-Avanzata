// Controller della creazione partita: adatta HTTP <-> GameService, senza logica ne' DB.

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import gameService from '../service/GameService';
import { toPublicGame } from '../dto/gameDto';

class GameController {
  public async create(req: Request, res: Response): Promise<void> {
    const { type, gridSize, ships, opponentEmail } = req.body as {
      type: 'pvp' | 'pvai';
      gridSize: number;
      ships: number[];
      opponentEmail?: string;
    };
    // req.user e' garantito dal middleware authenticate (routta protetta).
    const creatorId = req.user!.id;
    const game = await gameService.createGame({ creatorId, type, gridSize, ships, opponentEmail });
    res.status(StatusCodes.CREATED).json({ game: toPublicGame(game) });
  }
}

export default new GameController();