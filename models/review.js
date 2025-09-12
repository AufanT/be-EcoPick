'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Review dimiliki oleh satu User
      Review.belongsTo(models.User, {
        foreignKey: 'user_id'
      });

      // Review dimiliki oleh satu Product
      Review.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
    }
  }
  Review.init({
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    sentiment: {
      type: DataTypes.ENUM('positive', 'negative', 'neutral'),
      allowNull: true // Biarkan null pada awalnya
    }
  }, {
    sequelize,
    modelName: 'Review'
  });
  return Review;
};