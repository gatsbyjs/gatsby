import * as Joi from "@hapi/joi"
import { getService } from "gatsby-core-utils"
import fetch from "node-fetch"

import { REQUIRES_KEYS } from "./utils/constants"
import resourceSchema from "../resource-schema"

export const create = () => {}
export const update = () => {}
export const read = async ({ root }, id) => {
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
export const destroy = () => {}
export const config = {}

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

export const all = async ({ root }) => {
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

export { schema, validate }

export const plan = async () => {
  return {}
}
