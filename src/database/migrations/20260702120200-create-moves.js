'use strict';

/** Migrazione: creazione tabella "moves". 
 *  Viene tenuto in considerazione anche il salvataggio dello storico in .CSV
*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('moves', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Partita a cui appartiene la mossa
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'games', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Autore della mossa -> null = mossa effettuata dall'IA
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // Coordinate del colpo sulla griglia
      row: { type: Sequelize.INTEGER, allowNull: false },
      col: { type: Sequelize.INTEGER, allowNull: false },
      // Esito: 'hit' oppure 'miss'
      result: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Indice per velocizzare storico/CSV e conteggio mosse per partita
    await queryInterface.addIndex('moves', ['gameId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('moves');
  },
};