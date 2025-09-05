// migrations/xxxxxxxx-add-ml-attributes-to-products.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'main_material', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'is_biodegradable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Products', 'recycled_content', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'packaging_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'is_reusable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Products', 'has_eco_certification', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'main_material');
    await queryInterface.removeColumn('Products', 'is_biodegradable');
    await queryInterface.removeColumn('Products', 'recycled_content');
    await queryInterface.removeColumn('Products', 'packaging_type');
    await queryInterface.removeColumn('Products', 'is_reusable');
    await queryInterface.removeColumn('Products', 'has_eco_certification');
  }
};