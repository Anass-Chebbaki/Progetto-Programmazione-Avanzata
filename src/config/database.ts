// Pattern SINGLETON: garantisce un'unica istanza di connessione al database
// condivisa da tutta l'applicazione (usata dai DAO).

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente (in Docker sono gia' iniettate da env_file;
// in locale vengono lette dal file .env).
dotenv.config();

class DatabaseConnection {
  // Riferimento all'unica istanza della classe
  private static instance: DatabaseConnection;

  // L'unica istanza di Sequelize condivisa nell'app
  private readonly sequelize: Sequelize;

  // Costruttore PRIVATO: nessuno puo' fare "new DatabaseConnection()" dall'esterno.
  private constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME ?? 'battaglia_navale',
      process.env.DB_USERNAME ?? 'postgres',
      process.env.DB_PASSWORD ?? 'postgres',
      {
        host: process.env.DB_HOST ?? 'postgres',
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false, // niente log SQL rumorosi;si può riattivabile in debug
      },
    );
  }

  // Punto d'accesso globale: crea l'istanza al primo uso, poi la riusa sempre.
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Restituisce l'istanza Sequelize 
  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  // Verifica che la connessione al DB sia effettivamente stabilita
  public async authenticate(): Promise<void> {
    await this.sequelize.authenticate();
  }
}

export default DatabaseConnection;