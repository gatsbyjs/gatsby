import * as Joi from "@hapi/joi"

export default {
  id: Joi.string(),
  key: Joi.string(),
  _key: Joi.string(),
  _message: Joi.string(),
}
