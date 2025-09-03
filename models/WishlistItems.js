'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WishlistItem extends Model {
    static associate(models) {
      WishlistItem.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      WishlistItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  WishlistItem.init({
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    added_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'WishlistItems'
  });
  return WishlistItem;
};