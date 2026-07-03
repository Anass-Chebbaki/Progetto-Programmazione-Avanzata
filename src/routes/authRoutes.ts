// Rotte di autenticazione. Ogni rotta e' una catena di middleware:
// validazione/autenticazione prima, controller dopo.

import { Router } from 'express';
import authController from '../controller/AuthController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validation/authSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Valida il body (email) e poi emette il JWT.
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));

// Rotta protetta: richiede un JWT valido, poi restituisce req.user.
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;