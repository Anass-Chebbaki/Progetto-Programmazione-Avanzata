// Rotte amministrative. 
// Catena è: autentica -> solo admin -> valida -> handler.
import { Router } from 'express';
import adminController from '../controller/AdminController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { validateBody } from '../middleware/validate';
import { rechargeSchema } from '../validation/adminSchemas';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/admin/recharge', authenticate, requireAdmin, validateBody(rechargeSchema), asyncHandler(adminController.recharge));

export default router;