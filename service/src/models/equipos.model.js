// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const equipos = sequelizeClient.define('equipos', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    // ? ENUM (?)
    facultad: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    campus: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    deporte: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // ? 0 = MASCULINA 1 = FEMENINA
    categoria: {
      type: Sequelize.SMALLINT,
      allowNull: false
    },
    nombreEntrenador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidoEntrenador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nombreAsistente: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidoAsistente: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    // ? 0 = INACTIVO, 1 = ACTIVO
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  equipos.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    const { deportistas } = models;

    equipos.hasMany(deportistas, { foreignKey: 'equipo_id' });
  };

  equipos.sync({ alter: true });

  return equipos;
};
