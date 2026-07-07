'use strict';

/**
 * Set che è stato pensato per i test dei prossimi giorni
 * ---------------------------------------------------------------------
 * Seeder: utenti iniziali con credito token.
 * - admin@example.com : ruolo admin, credito ampio (ricarica) -> TODO prossimi giorni
 * - alice/bob         : utenti standard per partite PvP
 * - charlie           : credito 0 -> fixture per "credito insufficiente/esaurito"
 */

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      { email: 'admin@example.com',   role: 'admin', tokens: 100.000, createdAt: now, updatedAt: now },
      { email: 'alice@example.com',   role: 'user',  tokens: 5.000,   createdAt: now, updatedAt: now },
      { email: 'bob@example.com',     role: 'user',  tokens: 5.000,   createdAt: now, updatedAt: now },
      { email: 'charlie@example.com', role: 'user',  tokens: 0.000,   createdAt: now, updatedAt: now },
    ], {});
  },

  async down(queryInterface) {
    // Rimuove solo gli utenti inseriti da questo seeder
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'alice@example.com', 'bob@example.com', 'charlie@example.com'],
    }, {});
  },
};