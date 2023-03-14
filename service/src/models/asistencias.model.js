// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const asistencias = sequelizeClient.define('asistencias', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    deportista_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY(64), 
      defaultValue: Sequelize.NOW
    },
    horaEntrada: {
      type: Sequelize.DATE,
      allowNull: true,
      default:null
    },
    horaSalida: {
      type: Sequelize.DATE,
      allowNull: true,
      default:null
    },
  }, {
    timestamps: false,
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  asistencias.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    const { deportistas } = models;

    asistencias.belongsTo(deportistas, { foreignKey: 'deportista_id' });
  };

  asistencias.sync({ alter: true });

  return asistencias;
};
