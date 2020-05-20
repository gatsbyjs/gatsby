const Joi = require(`@hapi/joi`)

module.exports = {
  id: Joi.string(),
  key: Joi.string(),
  _message: Joi.string(),
}
