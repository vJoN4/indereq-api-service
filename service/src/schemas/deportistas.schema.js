const Joi = require('joi');

const POST_SCHEMA = Joi.object().keys({
  expediente: Joi.string().max(10).min(6).required().label('Expediente'),
  nombres: Joi.string().max(100).min(1).required().label('Nombres'),
  apellidos: Joi.string().max(100).min(10).required().label('Apellidos'),
  sexo: Joi.number().integer().valid(0, 1).required().label('Sexo'),
  facultad: Joi.string().max(80).min(10).required().label('Facultad'),
  jugadorSeleccionado: Joi.number().integer().valid(0, 1).label('Jugador seleccionado'),
  numJugador: Joi.any(),
  deporte: Joi.string().max(100).min(5).required().label('Deporte'),
  numSeguroSocial: Joi.string().max(11).min(11).required().label('Número de seguro social'),
  correo: Joi.string().email().max(100).min(10).required().label('Correo'),
  telefono: Joi.string().max(10).min(10).required().label('Teléfono'),
  telefonoEmergencia: Joi.string().max(10).min(10).required().label('Teléfono de emergencia'),
});

const PATCH_SCHEMA = Joi.object().keys({
  expediente: Joi.string().max(10).min(6).label('Expediente'),
  nombres: Joi.string().max(100).min(10).label('Nombres'),
  apellidos: Joi.string().max(100).min(10).label('Apellidos'),
  sexo: Joi.number().integer().valid(0, 1).label('Sexo'),
  facultad: Joi.string().max(80).min(10).label('Facultad'),
  jugadorSeleccionado: Joi.number().integer().valid(0, 1).label('Jugador seleccionado'),
  numJugador: Joi.any(),
  deporte: Joi.string().max(100).min(1).label('Deporte'),
  numSeguroSocial: Joi.string().max(11).min(11).label('Número de seguro social'),
  correo: Joi.string().email().max(100).min(10).label('Correo'),
  telefono: Joi.string().max(10).min(10).label('Teléfono'),
  telefonoEmergencia: Joi.string().max(10).min(10).label('Teléfono de emergencia'),
});

module.exports = {
  POST_SCHEMA,
  PATCH_SCHEMA
};
