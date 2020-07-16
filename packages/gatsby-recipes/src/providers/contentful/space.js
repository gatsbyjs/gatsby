import Joi from "@hapi/joi"

import client from "./client"
import resourceSchema from "../resource-schema"

const create = async (_context, { name }) => {
  const space = await client.createSpace({ name })
  const deliveryAccessToken = await space.createApiKey({
    name: `gatsby`,
  })

  return {
    name: space.name,
    id: space.sys.id,
    deliveryAccessToken: deliveryAccessToken.accessToken,
    _message: message(space),
  }
}

const read = async (_context, name) => {
  const spaces = await all()
  console.log(`all spaces`, spaces)

  if (!spaces) {
    return null
  }

  const space = spaces.find(s => s.name === name)

  return {
    ...space,
    id: space.sys.id,
  }
}

const destroy = async (_context, id) => {
  const space = await client.getSpace(id)

  const spaceResource = {
    name: space.name,
    id: space.sys.id,
  }

  await space.delete()

  return spaceResource
}

const all = async () => {
  const spaces = client.getSpaces()

  return spaces.items
}

const schema = {
  name: Joi.string(),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

const plan = async (context, { id, name }) => {
  const currentResource = await read(context, id || name)

  if (!currentResource) {
    return {
      name,
      id: `(Known after install)`,
      deliveryAccessToken: `(Known after install)`,
      currentState: ``,
      describe: `Create Contentful space "${name}"`,
      diffExists: true,
      skipDiff: true,
    }
  } else {
    return {
      currentState: currentResource,
      describe: `Contentful space ${name} already exists`,
      diff: ``,
    }
  }
}

const message = resource => `Created Contentful space ${resource.name}`

module.exports.schema = schema
module.exports.validate = validate
module.exports.plan = plan
module.exports.create = create
module.exports.read = read
module.exports.update = create
module.exports.destroy = destroy
module.exports.all = all
