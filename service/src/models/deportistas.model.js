// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const deportistas = sequelizeClient.define('deportistas', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    equipo_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    expediente: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // ? 0 = HOMBRE, 1 = MUJER
    sexo: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    // ? ENUM (?)
    facultad: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    telefonoEmergencia: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    numSeguroSocial: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    // ? 0 = NO, 1 = SI
    jugadorSeleccionado: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    numJugador: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
    },
    // ! MODELO (?)
    deporte: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    foto: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    fotoCardex: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    fotoIdentificacionOficial: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    // ? 0 = INACTIVO, 1 = ACTIVO
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
    },
  });

  // eslint-disable-next-line no-unused-vars
  deportistas.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    const { equipos } = models;

    deportistas.belongsTo(equipos, { foreignKey: 'equipo_id' });
  };

  deportistas.sync({ alter: true });

  return deportistas;
};
