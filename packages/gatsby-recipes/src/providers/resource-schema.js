import * as Joi from "joi"

export default {
  id: Joi.string(),
  key: Joi.string(),
  _key: Joi.string(),
  _message: Joi.string(),
}
