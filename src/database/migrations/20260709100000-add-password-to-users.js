'use strict';

// Migrazione: aggiunge la colonna password (hash bcrypt) alla tabella users.
 
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'password');
  },
};