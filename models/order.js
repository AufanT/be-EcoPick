'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order dimiliki oleh satu User
      Order.belongsTo(models.User, {
        foreignKey: 'user_id'
      });

      // Order memiliki banyak OrderItem
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id'
      });
    }
  }
  Order.init({
    user_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL,
    shipping_address: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Order'
  });
  return Order;
};