/**
(Senza questo wrapper dovremmo mettere un try/catch in ogni rotta)
------------------------------------------------------------------------
Avvolge un route handler asincrono e inoltra ogni rejection a next(err),
facendo confluire tutti gli errori nel middleware di gestione errori.

*/


import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}