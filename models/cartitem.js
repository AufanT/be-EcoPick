'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem dimiliki oleh satu User
      CartItem.belongsTo(models.User, {
        foreignKey: 'user_id'
      });

      // CartItem merujuk ke satu Product
      CartItem.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
    }
  }
  CartItem.init({
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartItem'
  });
  return CartItem;
};