import Joi from "@hapi/joi"

import client from "./client"
import resourceSchema from "../resource-schema"
import getGraphqlFields from "../utils/get-graphql-fields"
const getDiff = require(`../utils/get-diff`)

const GRAPHQL_FIELD_OPTIONS = {
  metadata: [`type`, `name`],
}

const create = async (context, { schema }) => {
  const spaceId = context.ContentfulSpace.id
  const space = await client.getSpace(spaceId)

  const fields = getGraphqlFields(schema, GRAPHQL_FIELD_OPTIONS)[0]
  const contentType = await space.createContentTypeWithId(fields.name, fields)
  await contentType.publish()

  return {
    name: contentType.name,
    id: contentType.sys.id,
    _message: message(contentType),
  }
}

const read = async (context, name) => {}

const destroy = async (_context, id) => {}

const all = async () => {}

const schema = {
  schema: Joi.string(),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

const plan = async (context, { id, schema }) => {
  const currentResource = await read(context, id)

  const fields = getGraphqlFields(schema, GRAPHQL_FIELD_OPTIONS)[0]
  console.log(`contentful type`, { currentResource, schema, id, fields })

  if (!currentResource) {
    return {
      id: `(Known after install)`,
      name: fields.name,
      currentState: ``,
      describe: `Create Contentful type "${fields.name}"`,
      diff: getDiff({}, fields),
      // diffExists: true,
      // skipDiff: true,
    }
  } else {
    return {
      currentState: currentResource,
      describe: `Contentful type ${currentResource.name} already exists`,
      // diff: getDiff(plan.currentState, plan.newState),
    }
  }
}

const message = resource => `Created Contentful type "${resource.name}"`

module.exports.schema = schema
module.exports.validate = validate
module.exports.plan = plan
module.exports.create = create
module.exports.read = read
module.exports.update = create
module.exports.destroy = destroy
module.exports.all = all
