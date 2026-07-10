'use strict';

/** Budget silence PER-GIOCATORE sulla tabella games (0-5, default 0). */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('games', 'silencePlayer1', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
    });
    await queryInterface.addColumn('games', 'silencePlayer2', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('games', 'silencePlayer2');
    await queryInterface.removeColumn('games', 'silencePlayer1');
  },
};