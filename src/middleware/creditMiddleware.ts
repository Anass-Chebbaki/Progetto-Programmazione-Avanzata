// Middleware: blocca con 401 le richieste di gioco
// se il credito dell'utente e' esaurito (<= 0). Il saldo e' letto dal DB perche'
// il JWT contiene solo metadati, non il credito (che è mutevole).

import { Request, Response, NextFunction } from 'express';
import userDAO from '../dao/UserDAO';
import User from '../model/User';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

export async function checkCredit(req: Request, _res: Response, next: NextFunction): Promise<void> {
  let user: User | null;
  try {
    user = await userDAO.findByPk(req.user!.id); // authenticate ha gia' popolato req.user
  } catch (err) {
    next(err);
    return;
  }

  if (user === null) {
    next(ErrorFactory.create(ErrorType.Unauthorized, 'Utente non trovato'));
    return;
  }

  // Credito esaurito: ogni richiesta di gioco viene negata.
  if (user.tokens <= 0) {
    next(ErrorFactory.create(ErrorType.Unauthorized, 'Credito esaurito'));
    return;
  }

  next();
}