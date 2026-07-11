// Controller admin: viene adattat HTTP <-> AdminService
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import adminService from '../service/AdminService';

class AdminController {
  // POST /admin/recharge — imposta il credito di un utente (email + nuovo credito).
  public async recharge(req: Request, res: Response): Promise<void> {
    const { email, tokens } = req.body as { email: string; tokens: number };
    const user = await adminService.recharge(email, tokens);
    // molto importante!! -> non serializziamo mai l'utente completo (es. password): solo email + credito.
    res.status(StatusCodes.OK).json({ email: user.email, tokens: user.tokens });
  }
}

export default new AdminController();