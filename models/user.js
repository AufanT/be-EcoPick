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
    full_name: { 
      type: DataTypes.STRING, 
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};