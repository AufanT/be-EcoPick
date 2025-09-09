'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'tracking_number', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'estimated_delivery', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'actual_delivery', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'courier_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Orders', 'tracking_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'tracking_number');
    await queryInterface.removeColumn('Orders', 'estimated_delivery');
    await queryInterface.removeColumn('Orders', 'actual_delivery');
    await queryInterface.removeColumn('Orders', 'courier_name');
    await queryInterface.removeColumn('Orders', 'tracking_url');
  }
};