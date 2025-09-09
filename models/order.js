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
    type: DataTypes.ENUM(
      'pending', 'paid', 'confirmed', 'processing', 
      'packed', 'shipped', 'out_for_delivery', 
      'delivered', 'cancelled', 'returned'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  tracking_number: DataTypes.STRING,
  estimated_delivery: DataTypes.DATE,
  actual_delivery: DataTypes.DATE,
  courier_name: DataTypes.STRING,
  tracking_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order'
  });
  return Order;
};