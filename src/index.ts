// Bootstrap mooolto minimal dell'applicazione: connessione al DB (via Singleton),
// endpoint di health-check e avvio del server Express.

import express from 'express';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
import DatabaseConnection from './config/database';
import './model'; // registra User/Game/Move e le loro associazioni all'avvio
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  const app = express();
  app.use(express.json());

  const db = DatabaseConnection.getInstance();
  try {
    await db.authenticate();
    console.log('[app] Connessione al database riuscita');
  } catch (err) {
    console.error('[app] Impossibile connettersi al database:', err);
    process.exit(1);
  }

  // Health-check
  app.get('/health', (_req, res) => {
    res.status(StatusCodes.OK).json({ status: 'ok', service: 'battaglia-navale-backend' });
  });

  // Rotte applicative
  app.use(routes);

  // Gestione errori: SEMPRE per ultimo, dopo le rotte.
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`[app] Server in ascolto sulla porta ${PORT}`);
  });
}

// Avvio dell'applicazione
bootstrap();