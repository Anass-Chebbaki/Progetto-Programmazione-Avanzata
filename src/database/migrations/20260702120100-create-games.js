'use strict';

/** Migrazione: creazione tabella "games". */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Tipologia: 'pvp' (utente vs utente) oppure 'PvAi' (utente vs IA)
      type: { type: Sequelize.STRING, allowNull: false },
      // Stato: 'in_progress' oppure 'completed'
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'in_progress' },
      // Griglia quadrata N x N (es. 10 o 20)
      gridSize: { type: Sequelize.INTEGER, allowNull: false },
      // Creatore della partita
      player1Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Avversario umano (null se la partita e' contro l'IA)
      player2Id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // Di chi e' il turno: 'player1' | 'player2'
      currentTurn: { type: Sequelize.STRING, allowNull: false, defaultValue: 'player1' },
      // Vincitore a fine partita: 'player1' | 'player2' (null finche' in corso)
      winner: { type: Sequelize.STRING, allowNull: true },
      // Flotte dei due giocatori 
      boardPlayer1: { type: Sequelize.JSONB, allowNull: true },
      boardPlayer2: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('games');
  },
};