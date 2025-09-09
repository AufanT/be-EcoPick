'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderTrackingHistory extends Model {
    static associate(models) {
      OrderTrackingHistory.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      OrderTrackingHistory.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updatedBy'
      });
    }
  }
  
  OrderTrackingHistory.init({
    order_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM(
        'pending', 'paid', 'confirmed', 'processing', 
        'packed', 'shipped', 'out_for_delivery', 
        'delivered', 'cancelled', 'returned'
      ),
      allowNull: false
    },
    status_description: DataTypes.STRING,
    location: DataTypes.STRING,
    notes: DataTypes.TEXT,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderTrackingHistory'
  });
  
  return OrderTrackingHistory;
};