// Middleware Admin: consente il passaggio solo agli utenti con ruolo admin.
// Va DOPO authenticate (usa req.user, che porta il ruolo dai metadati del JWT).

import { Request, Response, NextFunction } from 'express';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(ErrorFactory.create(ErrorType.Forbidden, 'Operazione riservata agli amministratori'));
    return;
  }
  next();
}