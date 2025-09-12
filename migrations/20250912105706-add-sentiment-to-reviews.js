'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reviews', 'sentiment', {
      type: Sequelize.ENUM('positive', 'negative', 'neutral'),
      allowNull: true,
      after: 'comment' 
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reviews', 'sentiment');
  }
};