'use strict';

// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

// Configurazione letta da sequelize-cli per migrazioni e seed.
// Le stesse variabili d'ambiente verranno usate dalla connessione applicativa (todo:singleton).
const common = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  seederStorage: 'sequelize', //rende i seed IDEMPOTENTI (ogni seeder gira una volta soltanto)
};

module.exports = {
  development: common,
  test: { ...common, database: `${process.env.DB_NAME || 'battaglia_navale'}_test` },
  production: common,
};