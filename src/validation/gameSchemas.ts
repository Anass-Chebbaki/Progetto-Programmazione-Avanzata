/**
 * valida il corpo di POST /games e applica i default (gridSize 10, flotta [5,4,3,3,2]).
 */
import { z } from 'zod';

export const createGameSchema = z
  .object({
    type: z.enum(['pvp', 'pvai']),
    gridSize: z.number().int().min(5).max(20).default(10),
    ships: z.array(z.number().int().positive()).min(1).default([5, 4, 3, 3, 2]),
    opponentEmail: z.email().optional(),
  })
  .superRefine((data, ctx) => {
    // PvP: avversario obbligatorio. PvAI: avversario vietato.
    if (data.type === 'pvp' && !data.opponentEmail) {
      ctx.addIssue({ code: 'custom', message: 'opponentEmail obbligatoria per una partita PvP', path: ['opponentEmail'] });
    }
    if (data.type === 'pvai' && data.opponentEmail) {
      ctx.addIssue({ code: 'custom', message: "opponentEmail non ammessa contro l'IA", path: ['opponentEmail'] });
    }
  });

export type CreateGameInput = z.infer<typeof createGameSchema>;