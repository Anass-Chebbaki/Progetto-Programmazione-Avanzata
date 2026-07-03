// Router centrale dell'applicazione: montiamoq i router di feature.
//PROVVUSORIO: più avanti agganciaremo /games, /moves ecc..

import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Rotte di autenticazione (definiscono i propri path: /login, /me).
router.use(authRoutes);

export default router;