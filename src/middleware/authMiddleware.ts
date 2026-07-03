// Middleware di autenticazione (Chain of Responsibility): valida il JWT in RS256
// e popola req.user con i metadati dell'utente. Gli errori vanno all'errorHandler.

import { Request, Response, NextFunction } from 'express';
import tokenService from '../service/TokenService';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Header assente o non nel formato "Bearer <token>".
  if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
    next(ErrorFactory.create(ErrorType.Unauthorized, 'Token mancante o malformato'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    // verify solleva UnauthorizedError se il token non e' valido o e' scaduto.
    req.user = tokenService.verify(token);
    next();
  } catch (err) {
    next(err);
  }
}