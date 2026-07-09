// Controller di autenticazione: adatta HTTP <-> service.

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../service/AuthService';

class AuthController {
  // POST /login — il body e' gia' stato validato dal middleware zod.
  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email: string; password: string};
    const token = await authService.login(email, password);
    res.status(StatusCodes.OK).json({ token });
  }

  // GET /me — rotta protetta di prova: restituisce i metadati dell'utente autenticato.
  public async me(req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.OK).json({ user: req.user });
  }
}

export default new AuthController();