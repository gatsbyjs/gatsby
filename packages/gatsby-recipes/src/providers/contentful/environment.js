import * as Joi from "@hapi/joi"

import client from "./client"
import resourceSchema from "../resource-schema"

const create = async (context, { name }) => {
  const spaceId = context.ContentfulSpace.id
  const space = await client.getSpace(spaceId)
  const environment = await space.createEnvironment({ name })

  return {
    name: environment.name,
    id: environment.sys.id,
    _message: message(environment),
  }
}

const read = async (context, name) => {
  console.log({ context, name })

  return undefined
}

const destroy = async (_context, id) => {}

const all = async () => {}

const schema = {
  name: Joi.string(),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

const plan = async (context, { id, name }) => {
  console.log({ context, name, id })
  const currentResource = await read(context, id || name)

  if (!currentResource) {
    return {
      currentState: ``,
      describe: `Create Contentful environment ${name}`,
      diffExists: true,
      skipDiff: true,
    }
  } else {
    return {
      currentState: currentResource,
      describe: `Contentful environment ${name} already exists`,
      diff: ``,
    }
  }
}

const message = resource => `Created Contentful environment "${resource.name}"`

export { schema, validate, plan, create, create as update, read, destroy, all }
