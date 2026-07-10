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
    silence: z.number().int().min(0).max(5).default(0) //budget iniziale (0-5)
  })
  .superRefine((data, ctx) => {
    // PvP: avversario obbligatorio. PvAI: avversario vietato.
    if (data.type === 'pvp' && !data.opponentEmail) {
      ctx.addIssue({ code: 'custom', message: 'opponentEmail obbligatoria per una partita PvP', path: ['opponentEmail'] });
    }
    if (data.type === 'pvai' && data.opponentEmail) {
      ctx.addIssue({ code: 'custom', message: "opponentEmail non ammessa contro l'IA", path: ['opponentEmail'] });
    }
    if (data.type === 'pvai' && data.silence > 0) {
      ctx.addIssue({ code: 'custom', message: 'silence disponibile solo nelle partite PvP', path: ['silence'] });
    }
  });
export type CreateGameInput = z.infer<typeof createGameSchema>;

// Mossa: coordinate 0-based. Il limite superiore (< gridSize) lo controlla il service.
//il silence non quì perchè lo arma il difensore su ROTTA DEDICARTA.
export const moveSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
});
export type MoveInput = z.infer<typeof moveSchema>;