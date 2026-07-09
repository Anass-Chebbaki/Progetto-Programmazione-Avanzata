/**
 * Logica di autenticazione
   ------------------------
 * Login per sola email. Se l'utente esiste, emette un JWT RS256 coi soli metadati essenziali.
 */

 //TODO: PASS (fatto!)
import bcrypt from 'bcryptjs';
import userDAO from '../dao/UserDAO';
import tokenService, { JwtUserPayload } from './TokenService';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

class AuthService {
  public async login(email: string, password: string): Promise<string> {
    const user = await userDAO.findByEmail(email);
    if (user === null) {
      throw ErrorFactory.create(ErrorType.Unauthorized, 'Credenziali non valide');
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw ErrorFactory.create(ErrorType.Unauthorized, 'Credenziali non valide');
    }

    // Solo metadati nel token: niente password, niente saldo (sta nel DB).
    const payload: JwtUserPayload = { id: user.id, email: user.email, role: user.role };
    return tokenService.sign(payload);
  }
}

export default new AuthService();