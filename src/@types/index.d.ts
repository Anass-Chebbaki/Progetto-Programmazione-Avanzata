// Estende il tipo Request di Express per trasportare l'utente autenticato (req.user).
// Popolato dal middleware di autenticazione (authMiddleware,ts); opzionale perche' presente solo dopo di esso.

import type { JwtUserPayload } from '../../service/TokenService';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

// FILE -> MODULO: necessario affinche' "declare global" effettui il merge.
export {};