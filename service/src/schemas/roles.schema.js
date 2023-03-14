const Joi = require('joi');

const POST_SCHEMA = Joi.object().keys({
  group: Joi.string().max(20).min(1).lowercase().trim().required().label('Group'),
  name: Joi.string().max(50).min(1).trim().required().label('Nombre'),
  permissions: Joi.array().items(
    Joi.object().keys({
      actions: Joi.array().items(Joi.string().max(20).min(1)).required().label('Actions'),
      subject: Joi.array().items(Joi.string().max(20).min(1)).required().label('Asunto'),
      conditions: Joi.object().empty().label('Conditions'),
    })
  ),
  status: Joi.number().integer().valid(0, 1).default(1).required().label('Estatus'),
  created_by: Joi.string().trim().guid().label('Creado por'),
});

const PATCH_SCHEMA = Joi.object().keys({
  group: Joi.string().max(20).lowercase().trim().label('Group'),
  name: Joi.string().max(50).trim().label('Nombre'),
  permissions: Joi.array().items(
    Joi.object().keys({
      actions: Joi.array().items(Joi.string().max(20).min(1)).required().label('Actions'),
      subject: Joi.array().items(Joi.string().max(20).min(1)).required().label('Asunto'),
      conditions: Joi.object().empty().label('Conditions'),
    })
  ),
  status: Joi.number().integer().valid(0, 1).label('Estatus'),
  updated_by: Joi.string().trim().guid().label('Actualizado por'),
});

module.exports = {
  POST_SCHEMA,
  PATCH_SCHEMA
};
