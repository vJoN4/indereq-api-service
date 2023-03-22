// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const roles = sequelizeClient.define(
    'roles',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      group: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      permissions: {
        type: DataTypes.TEXT('long'),

        // ? Mariadb
        // type: DataTypes.JSON,
        // defaultValue: '[]',
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1,
      },
      created_by: DataTypes.UUID,
      updated_by: DataTypes.UUID,
    },
    {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeCount(options) {
          options.raw = true;
        },
      },
    }
  );

  roles.sync({ alter: true });

  return roles;
};
