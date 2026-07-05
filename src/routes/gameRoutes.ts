// Rotte delle partite. POST /games (protetta): 
// autentica -> valida -> crea.

import { Router } from 'express';
import gameController from '../controller/GameController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { createGameSchema, moveSchema } from '../validation/gameSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/games', authenticate, validateBody(createGameSchema), asyncHandler(gameController.create));

// Esegui una mossa nella partita :id.
router.post('/games/:id/moves', authenticate, validateBody(moveSchema), asyncHandler(gameController.move));

export default router;