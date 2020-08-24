module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('cities', 'regionId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'regions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }, { transaction: t }),
        queryInterface.addColumn('streets', 'cityId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'cities',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }, { transaction: t })
      ]);
    });
  },
  down: queryInterface => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('cities', 'regionId', { transaction: t }),
        queryInterface.removeColumn('streets', 'cityId', { transaction: t })
      ]);
    });
  }
};
