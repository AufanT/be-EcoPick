'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserProductViewHistory extends Model {
        static associate(models) {
            UserProductViewHistory.belongsTo(models.User, { foreignKey: 'user_id' });
            UserProductViewHistory.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    UserProductViewHistory.init({
        user_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER
    },  {
        sequelize,
        modelName: 'UserProductViewHistory',
    });
    return UserProductViewHistory;
};