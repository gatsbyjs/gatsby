const Joi = require(`joi`)

module.exports = {
  id: Joi.string(),
  key: Joi.string(),
  _message: Joi.string(),
}
