'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class City extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            City.belongsTo(models.Region);
            City.hasMany(models.Street, {
                foreignKey: 'cityId',
                onDelete: 'cascade',
                onUpdate: 'cascade',
                hooks: true
            });
        }
    };
    City.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'City',
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    });
    return City;
};
