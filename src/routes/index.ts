// Router centrale dell'applicazione: montiamoq i router di feature.
//PROVVUSORIO: più avanti agganciaremo /games, /moves ecc..

import { Router } from 'express';
import authRoutes from './authRoutes';
import gameRoutes from './gameRoutes';
import adminRoutes from './adminRoutes';


const router = Router();

// Rotte di autenticazione
router.use(authRoutes);
// rotte di games
router.use(gameRoutes);
// rotte admin
router.use(adminRoutes);

export default router;