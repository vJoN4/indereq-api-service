// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const blacklist = sequelizeClient.define(
    'blacklist',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expire_in: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeCount(options) {
          options.raw = true;
        },
      },
    }
  );

  blacklist.sync();

  return blacklist;
};
