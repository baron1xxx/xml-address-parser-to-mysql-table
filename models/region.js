'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Region.hasMany(models.City, {
        foreignKey: 'regionId',
        onDelete: 'cascade',
        onUpdate: 'cascade',
        hooks: true
      })
    }
  };

  Region.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Region',
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
  return Region;
};
