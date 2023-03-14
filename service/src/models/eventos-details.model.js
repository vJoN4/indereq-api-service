// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const eventosDetails = sequelizeClient.define('eventos_details', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    evento_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    deportista_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  eventosDetails.associate = function (models) {

    const { eventos, deportistas } = models;
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    eventosDetails.belongsTo(eventos, { foreignKey: 'evento_id' });
    eventosDetails.belongsTo(deportistas, { foreignKey: 'deportista_id' });
  };

  eventosDetails.sync({ alter: true });

  return eventosDetails;
};
