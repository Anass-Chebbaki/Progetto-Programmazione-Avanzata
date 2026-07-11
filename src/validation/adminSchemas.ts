import { z } from 'zod';

// Body di POST /admin/recharge: email dell'utente + nuovo credito (>= 0, anche frazionario)
export const rechargeSchema = z.object({
  email: z.email('Email non valida'),
  tokens: z.number().min(0, "Il credito non puo' essere negativo"),
});

export type RechargeInput = z.infer<typeof rechargeSchema>;