// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const eventos = sequelizeClient.define('eventos', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY(64),
      allowNull: false
    },
    hora: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    equipo_local_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    directorTecnicoLocal: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    puntosLocal: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    canchaJugada: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    equipo_visitante_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    directorTecnicoVisitante: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    puntosVisitante: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    jornada: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    incidentes: {
      type: DataTypes.STRING(140),
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  eventos.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    const { eventos_details, equipos } = models;

    eventos.hasMany(eventos_details, { foreignKey: 'evento_id' });
    eventos.belongsTo(equipos, { as: 'EquipoLocal', foreignKey: 'equipo_local_id' });
    eventos.belongsTo(equipos, { as: 'EquipoVisitante', foreignKey: 'equipo_visitante_id' });
  };

  eventos.sync({ alter: true });

  return eventos;
};
