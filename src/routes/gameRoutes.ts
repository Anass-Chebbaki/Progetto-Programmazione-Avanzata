// Rotte delle partite: creazione e mossa. 
// Catena: autentica -> credito -> valida -> handler.

import { Router } from 'express';
import gameController from '../controller/GameController';
import { authenticate } from '../middleware/authMiddleware';
import { checkCredit } from '../middleware/creditMiddleware';
import { validateBody } from '../middleware/validate';
import { createGameSchema, moveSchema } from '../validation/gameSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

//===============================================================================
// 1) Creazione: gated dal credito (401 se saldo <= 0, "Credito esaurito";
// 2) il controllo < 0.35 dentro il service dara' invece "Credito insufficiente").
// 3) Mossa e stato: NIENTE checkCredit (operazioni in-partita).
// 4) nuova feature: il difensore può "armare" il silence
// 5) nuova rotta: creazione stroico .csv
//===============================================================================

router.post('/games', authenticate, checkCredit, validateBody(createGameSchema), asyncHandler(gameController.create));
router.post('/games/:id/moves', authenticate, validateBody(moveSchema), asyncHandler(gameController.move));
router.post('/games/:id/silence', authenticate, asyncHandler(gameController.armSilence));
router.get('/games/:id', authenticate, asyncHandler(gameController.state));
router.get('/games/:id/moves/csv', authenticate, asyncHandler(gameController.movesCsv));
export default router;