'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Tas Ramah Lingkungan Canvas',
        category_id: 1,
        description: 'Tas kanvas terbuat dari bahan daur ulang, tahan lama dan stylish',
        price: 150000.00,
        stock_quantity: 50,
        image_url: 'https://example.com/images/eco-canvas-bag.jpg',
        materials: JSON.stringify(['Canvas Organik', 'Tali Rami']),
        origin: 'Indonesia',
        is_eco_friendly_ml: true,
        is_eco_friendly_admin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Botol Minum Stainless Steel',
        category_id: 2,
        description: 'Botol minum anti karat, bebas BPA, menjaga suhu hingga 12 jam',
        price: 75000.00,
        stock_quantity: 100,
        image_url: 'https://example.com/images/steel-bottle.jpg',
        materials: JSON.stringify(['Stainless Steel 304', 'Silicon Seal']),
        origin: 'Indonesia',
        is_eco_friendly_ml: true,
        is_eco_friendly_admin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Madu Organik Hutan',
        category_id: 3,
        description: 'Madu murni dari hutan Indonesia, tanpa pengawet dan pemanis buatan',
        price: 125000.00,
        stock_quantity: 30,
        image_url: 'https://example.com/images/organic-honey.jpg',
        materials: JSON.stringify(['Madu Murni 100%']),
        origin: 'Kalimantan, Indonesia',
        is_eco_friendly_ml: true,
        is_eco_friendly_admin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};