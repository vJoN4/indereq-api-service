const Joi = require('joi');

const POST_SCHEMA = Joi.object().keys({
  rol_id: Joi.string().trim().guid().required().label('Rol'),
  username: Joi.string().trim().lowercase().min(4).regex(/^[a-z0-9_.-]*$/).message({
    'string.pattern.base': [
      'Puede contener números y letras',
      'Puede contener alguno de los siguientes caracteres especiales _.-',
    ].join('\n'),
  }).trim().required().label('Usuario'),
  email: Joi.string().lowercase().email({ minDomainSegments: 2 }).trim().label('Correo electrónico'),
  password: Joi.string().regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?=.*[!@#$%^&*;]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/).message({
    'string.pattern.base': [
      'Debe contener al menos 1 letra mayúscula',
      'Debe contener al menos 1 letra minúscula',
      'Debe contener al menos 1 número',
      'Debe contener al menos un carácter especial !@#$%^&*;',
      'Debe tener un mínimo de 8 caracteres',
      'La longitud máxima de la contraseña no debe limitarse arbitrariamente',
    ].join('\n'),
  }).required().label('Contraseña'),
  rpassword: Joi.string().valid(Joi.ref('password')).required().label('Confirmar contraseña'),
  photo: Joi.string().trim().label('Foto'),
  full_name: Joi.string().max(100).required().label('Nombre completo'),
  status: Joi.number().integer().valid(0, 1).default(0).label('Estatus'),
  created_by: Joi.string().trim().guid().label('Creado por'),
});

const PATCH_SCHEMA = Joi.object().keys({
  rol_id: Joi.string().trim().guid().label('Rol'),
  username: Joi.string().trim().lowercase().min(4).regex(/^[a-z0-9_.-]*$/).message({
    'string.pattern.base': [
      'Puede contener números y letras',
      'Puede contener alguno de los siguientes caracteres especiales _.-',
    ].join('\n'),
  }).trim().label('Usuario'),
  email: Joi.string().lowercase().email({ minDomainSegments: 2 }).trim().label('Correo electrónico'),
  password: Joi.string().regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?=.*[!@#$%^&*;]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/).message({
    'string.pattern.base': [
      'Debe contener al menos 1 letra mayúscula',
      'Debe contener al menos 1 letra minúscula',
      'Debe contener al menos 1 número',
      'Debe contener al menos un carácter especial !@#$%^&*;',
      'Debe tener un mínimo de 8 caracteres',
      'La longitud máxima de la contraseña no debe limitarse arbitrariamente',
    ].join('\n'),
  }).label('Contraseña'),
  rpassword: Joi.string().valid(Joi.ref('password')).label('Confirmar password'),
  photo: Joi.string().trim().label('Foto'),
  full_name: Joi.string().max(100).label('Nombre completo'),
  status: Joi.number().integer().valid(0, 1).label('Estatus'),
  updated_by: Joi.string().trim().guid().label('Actualizado por'),

  pass_attempts: Joi.number().integer().label('Password attempts'),

  show_ticket: Joi.boolean().label('Mostrar ticket'),

  // Reset password mechanism
  token_password: Joi.string().allow('').label('Token de contraseña'),
  token_expires: Joi.date().label('Expiración de token'),

  // Verify email
  token: Joi.string().allow('').label('Token'),
});

module.exports = {
  POST_SCHEMA,
  PATCH_SCHEMA
};
