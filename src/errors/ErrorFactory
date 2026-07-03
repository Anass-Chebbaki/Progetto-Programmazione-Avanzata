// Pattern FACTORY: costruzione centralizzata degli oggetti errore.
// Il resto del codice chiede un errore "per tipo" e non dipende dalle classi concrete.

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from './AppError';

// Tipi di errore disponibili (le "key" della Factory)
export enum ErrorType {
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
  Conflict = 'Conflict',
  InternalServer = 'InternalServer',
}

export class ErrorFactory {
  // Crea l'errore concreto corrispondente al tipo richiesto.
  // Se message e' omesso, ogni errore usa il proprio messaggio di default.
  public static create(type: ErrorType, message?: string): AppError {
    switch (type) {
      case ErrorType.BadRequest:
        return new BadRequestError(message);
      case ErrorType.Unauthorized:
        return new UnauthorizedError(message);
      case ErrorType.Forbidden:
        return new ForbiddenError(message);
      case ErrorType.NotFound:
        return new NotFoundError(message);
      case ErrorType.Conflict:
        return new ConflictError(message);
      case ErrorType.InternalServer:
        return new InternalServerError(message);
      default:
        return new InternalServerError(message);
    }
  }
}