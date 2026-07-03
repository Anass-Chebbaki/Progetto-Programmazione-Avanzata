// Middleware di validazione generico (CoR): valida req.body contro uno schema zod. 
// In caso di errore, delega all'errorHandler tramite next(err).

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

// Factory: produce un middleware legato allo schema passato (riutilizzabile ovunque).
export function validateBody(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Concatena i messaggi dei singoli problemi di validazione.
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(ErrorFactory.create(ErrorType.BadRequest, message));
      return;
    }
    // Dati validati e normalizzati: il controller li riceve gia' puliti.
    req.body = result.data;
    next();
  };
}