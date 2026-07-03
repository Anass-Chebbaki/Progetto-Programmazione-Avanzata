// Gerarchia degli errori applicativi. Ogni errore trasporta il proprio codice HTTP,
// così il middleware di gestione errori puo' limitarsi a leggerlo.

import { StatusCodes } from 'http-status-codes';

export abstract class AppError extends Error {
  public readonly statusCode: number;
  // true = errore "previsto" dall'applicazione : utile per logging/monitoring
  public readonly isOperational: boolean;

  // protected: AppError non e' istanziabile direttamente, solo tramite sottoclasse.
  protected constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Ripristina la catena di prototipi: necessario estendendo Error, fa funzionare instanceof.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    // Stack trace pulito, senza il frame del costruttore.
    Error.captureStackTrace(this, this.constructor);
  }
}

// --- Sottoclassi concrete: una per codice HTTP che ci serve ---

export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') { super(message, StatusCodes.BAD_REQUEST); } // 400
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato') { super(message, StatusCodes.UNAUTHORIZED); }     // 401
}
export class ForbiddenError extends AppError {
  constructor(message = 'Accesso negato') { super(message, StatusCodes.FORBIDDEN); }         // 403
}
export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') { super(message, StatusCodes.NOT_FOUND); }    // 404
}
export class ConflictError extends AppError {
  constructor(message = 'Conflitto con lo stato attuale') { super(message, StatusCodes.CONFLICT); }  // 409
}
export class InternalServerError extends AppError {
  constructor(message = 'Errore interno del server') { super(message, StatusCodes.INTERNAL_SERVER_ERROR); } // 500
}