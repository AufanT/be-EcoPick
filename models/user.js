'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {  
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
      // User memiliki banyak Review
      User.hasMany(models.Review, {
        foreignKey: 'user_id',
        as: 'reviews'
      });

      // User memiliki banyak Order
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders'
      });

      // User memiliki banyak item di keranjang
      User.hasMany(models.CartItem, {
        foreignKey: 'user_id',
        as: 'cart_items'
      });

      // User memiliki banyak item di wishlist
      User.hasMany(models.WishlistItem, {
        foreignKey: 'user_id',
        as: 'wishlist_items'
      });
    }
  }
  User.init({
    full_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    address: DataTypes.TEXT,
    phone_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users'
  });
  return User;
};