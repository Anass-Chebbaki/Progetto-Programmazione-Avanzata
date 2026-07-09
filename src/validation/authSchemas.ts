// Schema di validazione per l'autenticazione. La validazione applicativa vive qui,
// separata dalla logica: i middleware la applicano, i controller riceveranno in "pasto" i dati gia' validi.

import { z } from 'zod';

// Body atteso da POST /login: una sola email valida + password 
export const loginSchema = z.object({
  email: z.email('Email non valida'),
  password: z.string().min(1, 'password obblgatoria')
});

export type LoginInput = z.infer<typeof loginSchema>;