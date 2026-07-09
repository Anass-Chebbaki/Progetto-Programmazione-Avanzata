'use strict';

const bcrypt = require('bcryptjs');
// Password note per la demo, salvate SOLO come hash bcrypt (mai in chiaro).
const hash = (plain) => bcrypt.hashSync(plain, 10);

/**
 * Seeder: utenti iniziali con credito token e password.
 * - admin@example.com   / admin123    : ruolo admin (ricarica)
 * - alice / bob         / alice123,bob123 : utenti PvP
 * - charlie             / charlie123  : credito 0 (fixture "credito esaurito")
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      { email: 'admin@example.com',   role: 'admin', tokens: 100.000, password: hash('admin123'),   createdAt: now, updatedAt: now },
      { email: 'alice@example.com',   role: 'user',  tokens: 5.000,   password: hash('alice123'),   createdAt: now, updatedAt: now },
      { email: 'bob@example.com',     role: 'user',  tokens: 5.000,   password: hash('bob123'),     createdAt: now, updatedAt: now },
      { email: 'charlie@example.com', role: 'user',  tokens: 0.000,   password: hash('charlie123'), createdAt: now, updatedAt: now },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'alice@example.com', 'bob@example.com', 'charlie@example.com'],
    }, {});
  },
};