const Joi = require(`@hapi/joi`)
const { store } = require(`gatsby/dist/redux`)

const { REQUIRES_KEYS } = require(`./utils/constants`)
const resourceSchema = require(`../resource-schema`)

module.exports.create = () => {}
module.exports.update = () => {}
module.exports.read = () => {}
module.exports.destroy = () => {}
module.exports.config = {}

module.exports.all = async ({ root }) => {
  const pages = store.getState().pages
  console.log(pages)
  return pages
}
const schema = {
  internalComponentName: Joi.string(),
  path: Joi.string(),
  matchPath: Joi.string().optional(),
  component: Joi.string(),
  componentChunkName: Joi.string(),
  isCreatedByStatefulCreatePages: Joi.boolean(),
  updatedAt: Joi.number(),
  pluginCreatorId: Joi.string(),
  componentPath: Joi.string(),
  ...resourceSchema,
}

const validate = resource => {
  if (REQUIRES_KEYS.includes(resource.name) && !resource.key) {
    return {
      error: `${resource.name} requires a key to be set`,
    }
  }

  if (resource.key && resource.key === resource.name) {
    return {
      error: `${resource.name} requires a key to be different than the plugin name`,
    }
  }

  return Joi.validate(resource, schema, { abortEarly: false })
}

exports.schema = schema
exports.validate = validate

module.exports.plan = async () => {
  return {}
}
