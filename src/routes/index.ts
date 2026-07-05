// Router centrale dell'applicazione: montiamoq i router di feature.
//PROVVUSORIO: più avanti agganciaremo /games, /moves ecc..

import { Router } from 'express';
import authRoutes from './authRoutes';
import gameRoutes from './gameRoutes';


const router = Router();

// Rotte di autenticazione (definiscono i propri path: /login, /me).
router.use(authRoutes);
// rotte di games
router.use(gameRoutes);

export default router;