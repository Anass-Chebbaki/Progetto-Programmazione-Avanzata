'use strict';

/** Migrazione: creazione tabella "users". 
 * il timestamp garantisceordine di esecuzione e dipendenze delle FK
*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Email univoca: identificatore logico dell'utente (usato per auth JWT e per indicare l'avversario)
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      // Ruolo applicativo: 'user' oppure 'admin'
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user',
      },
      // IMPORTANE -> Credito token: frazionario, quindi DECIMAL con 3 decimali (copre 0.015)
      tokens: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};