'use strict';

/** Flag silenced sulle mosse (true = esito nascosto fino a fine partita). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('moves', 'silenced', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('moves', 'silenced');
  },
};