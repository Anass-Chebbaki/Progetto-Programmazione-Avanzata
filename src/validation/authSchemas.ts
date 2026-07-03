// Schema di validazione per l'autenticazione. La validazione applicativa vive qui,
// separata dalla logica: i middleware la applicano, i controller riceveranno in "pasto" i dati gia' validi.

import { z } from 'zod';

// Body atteso da POST /login: una sola email valida.
export const loginSchema = z.object({
  email: z.email('Email non valida'),
});

export type LoginInput = z.infer<typeof loginSchema>;