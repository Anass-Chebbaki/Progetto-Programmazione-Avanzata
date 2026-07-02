// Bootstrap mooolto minimal dell'applicazione: connessione al DB (via Singleton),
// endpoint di health-check e avvio del server Express.

import express from 'express';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
import DatabaseConnection from './config/database';
import './model'; // registra User/Game/Move e le loro associazioni all'avvio

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  const app = express();
  app.use(express.json()); // parsing del body JSON per le rotte future

  // Recupera l'UNICA connessione al DB (Singleton) e verificala istant.
  const db = DatabaseConnection.getInstance();
  try {
    await db.authenticate();
    console.log('[app] Connessione al database riuscita');
  } catch (err) {
    // Fail-fast: se il DB non e' raggiungibile, non ha senso avviare l'app.
    console.error('[app] Impossibile connettersi al database:', err);
    process.exit(1);
  }

  // Endpoint di health-check: risponde 200 se l'app e' in piedi.
  app.get('/health', (_req, res) => {
    res.status(StatusCodes.OK).json({
      status: 'ok',
      service: 'battaglia-navale-backend',
    });
  });

  app.listen(PORT, () => {
    console.log(`[app] Server in ascolto sulla porta ${PORT}`);
  });
}

// Avvio dell'applicazione
bootstrap();