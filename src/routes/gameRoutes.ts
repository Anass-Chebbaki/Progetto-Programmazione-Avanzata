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

router.post('/games', authenticate, checkCredit, validateBody(createGameSchema), asyncHandler(gameController.create));
router.post('/games/:id/moves', authenticate, checkCredit, validateBody(moveSchema), asyncHandler(gameController.move));
router.get('/games/:id', authenticate, checkCredit, asyncHandler(gameController.state));

export default router;