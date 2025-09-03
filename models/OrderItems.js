'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem dimiliki oleh satu Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id'
      });

      // OrderItem merujuk ke satu Product
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
    }
  }
  OrderItem.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price_per_unit: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItems'
  });
  return OrderItem;
};