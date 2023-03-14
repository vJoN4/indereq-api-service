// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define(
    'users',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      rol_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      token: DataTypes.STRING,
      token_expires: DataTypes.DATE,
      token_password: DataTypes.STRING,
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
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

  users.associate = function (models) {
    const { roles } = models;

    users.belongsTo(roles, { foreignKey: 'rol_id' });
  };

  users.sync();

  return users;
};
