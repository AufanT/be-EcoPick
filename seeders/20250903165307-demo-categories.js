'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Fashion Berkelanjutan',
        description: 'Pakaian dan aksesoris ramah lingkungan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Produk Rumah Eco',
        description: 'Peralatan rumah tangga ramah lingkungan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Makanan Organik',
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