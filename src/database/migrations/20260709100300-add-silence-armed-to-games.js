'use strict';

/** Flag "silenzio armato" per-giocatore: true = il prossimo colpo subito sara' silenziato. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('games', 'silenceArmedPlayer1', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
    });
    await queryInterface.addColumn('games', 'silenceArmedPlayer2', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('games', 'silenceArmedPlayer2');
    await queryInterface.removeColumn('games', 'silenceArmedPlayer1');
  },
};