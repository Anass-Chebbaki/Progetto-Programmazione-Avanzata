/**
 * Servizio JWT in schema RS256: firma con la chiave privata, verifica con la pubblica. 
 * Le chiavi sono generate dall'entrypoint (su docker) e mai versionate; 
 * qui vengono lette dai path indicati nel .env.
 */

import fs from 'fs';
import path from 'path';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ErrorFactory, ErrorType } from '../errors/ErrorFactory';

// Metadati essenziali dell'utente trasportati dal token (niente saldo token: sta nel DB).
export interface JwtUserPayload {
  id: number;
  email: string;
  role: string;
}

class TokenService {
  // Cache delle chiavi (lette una sola volta, alla prima firma/verifica).
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  // Chiave privata (firma): letta dal path nel .env, con default sensato.
  private getPrivateKey(): string {
    if (this.privateKey === null) {
      const keyPath = path.resolve(process.env.PRIVATE_KEY_PATH ?? './src/secrets/jwtRS256.key');
      this.privateKey = fs.readFileSync(keyPath, 'utf-8');
    }
    return this.privateKey;
  }

  // Chiave pubblica (verifica).
  private getPublicKey(): string {
    if (this.publicKey === null) {
      const keyPath = path.resolve(process.env.PUBLIC_KEY_PATH ?? './src/secrets/jwtRS256.key.pub');
      this.publicKey = fs.readFileSync(keyPath, 'utf-8');
    }
    return this.publicKey;
  }

  // Firma un token contenente i soli metadati utente.
  public sign(payload: JwtUserPayload): string {
    const options: SignOptions = {
      algorithm: 'RS256',
      // expiresIn arriva come stringa di durata (es. "1h") dal .env: cast al tipo atteso.
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.getPrivateKey(), options);
  }

  // Verifica un token e restituisce il payload tipizzato; solleva 401 se non valido.
  public verify(token: string): JwtUserPayload {
    let decoded: string | jwt.JwtPayload;
    try {
      // algorithms esplicito: accettiamo SOLO RS256 (previene l'algorithm confusion).
      decoded = jwt.verify(token, this.getPublicKey(), { algorithms: ['RS256'] });
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'TokenExpiredError'
          ? 'Token scaduto'
          : 'Token non valido';
      throw ErrorFactory.create(ErrorType.Unauthorized, message);
    }
    // Un payload valido e' un oggetto, non una stringa.
    if (typeof decoded === 'string') {
      throw ErrorFactory.create(ErrorType.Unauthorized, 'Token non valido');
    }
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  }
}

// Istanza unica riutilizzabile in tutta l'app.
export default new TokenService();