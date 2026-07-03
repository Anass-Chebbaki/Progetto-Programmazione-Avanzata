// Middleware TERMINALE di gestione errori (ultimo della catena).
// eccezion -> risposte JSON coerenti.

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

// Firma a 4 parametri (ERROR-handling middleware per Express)
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Errori applicativi previsti: usiamo il loro codice e messaggio.
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { name: err.name, message: err.message },
    });
    return;
  }

  // Errori imprevisti: log lato server + 500 generico (nessun dettaglio interno esposto).
  console.error('[errorHandler] Errore non gestito:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: { name: 'InternalServerError', message: 'Errore interno del server' },
  });
}