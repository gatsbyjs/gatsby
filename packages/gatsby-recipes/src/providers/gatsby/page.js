const Joi = require(`@hapi/joi`)
const { getService } = require(`gatsby-core-utils/dist/service-lock`)
const fetch = require(`node-fetch`)

const { REQUIRES_KEYS } = require(`./utils/constants`)
const resourceSchema = require(`../resource-schema`)

module.exports.create = () => {}
module.exports.update = () => {}
module.exports.read = async ({ root }, id) => {
  const result = await queryDevelopAPI(
    { root },
    `
  {
    sitePage(id: { eq: "${id}" }) {
        path
        component
        internalComponentName
        componentChunkName
        matchPath
        id
        componentPath
        isCreatedByStatefulCreatePages
        pluginCreator {
          name
        }
  }
  }
  `
  )

  return result.data.sitePage
}
module.exports.destroy = () => {}
module.exports.config = {}

const queryDevelopAPI = async ({ root }, query) => {
  const { port } = await getService(root, `developproxy`)

  const res = await fetch(`http://localhost:${port}/___graphql`, {
    method: `POST`,
    body: JSON.stringify({
      query,
    }),
    headers: {
      Accept: `application/json`,
      "Content-Type": `application/json`,
    },
  })
  const body = await res.json()

  return body
}

module.exports.all = async ({ root }) => {
  const result = await queryDevelopAPI(
    { root },
    `
  {
    allSitePage {
      nodes {
        path
        component
        internalComponentName
        componentChunkName
        matchPath
        id
        componentPath
        isCreatedByStatefulCreatePages
        pluginCreator {
          name
        }
      }
    }
  }
  `
  )

  return result.data.allSitePage.nodes
}

const schema = {
  internalComponentName: Joi.string(),
  path: Joi.string(),
  matchPath: Joi.string().optional(),
  component: Joi.string(),
  componentChunkName: Joi.string(),
  isCreatedByStatefulCreatePages: Joi.boolean(),
  pluginCreatorId: Joi.string(),
  componentPath: Joi.string(),
  pluginCreator: Joi.object({
    name: Joi.string(),
  }),
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
