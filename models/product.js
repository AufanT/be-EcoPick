'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Product dimiliki oleh satu Category
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id'
      });

      // Product memiliki banyak Reviews
      Product.hasMany(models.Review, {
        foreignKey: 'product_id',
        as: 'Reviews'
      });

      // Product bisa ada di banyak OrderItem
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id'
      });

      // Product bisa ada di banyak CartItem
      Product.hasMany(models.CartItem, {
        foreignKey: 'product_id'
      });

      // Product bisa ada di banyak WishlistItem
      Product.hasMany(models.WishlistItem, {
        foreignKey: 'product_id'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    stock_quantity: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    materials: DataTypes.JSON,
    origin: DataTypes.STRING,
    is_eco_friendly_ml: DataTypes.BOOLEAN,
    is_eco_friendly_admin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Product'
  });
  return Product;
};