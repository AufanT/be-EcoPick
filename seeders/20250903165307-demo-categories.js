'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Lifestyle',
        description: 'Pakaian dan aksesoris ramah lingkungan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kitchen',
        description: 'Peralatan rumah tangga ramah lingkungan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Personal Care',
        description: 'Makanan dan minuman organik',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};