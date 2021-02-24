import * as Joi from "@hapi/joi"

import resourceSchema from "../resource-schema"
import client from "./client"
import getDiff from "../utils/get-diff"

const create = async (context, { fields }) => {
  const spaceId = context.ContentfulSpace.id
  const contentTypeId = context.ContentfulType.id
  const space = await client.getSpace(spaceId)

  const entry = await space.createEntryWithId(contentTypeId, `pizza-face`, {
    fields: {
      title: {
        "en-US": fields.title,
      },
      body: {
        "en-US": fields.body,
      },
    },
  })

  await entry.publish()

  console.log(`new entry`, entry)

  return {
    ...entry,
    id: entry.sys.id,
    _message: message(entry),
  }
}

const read = async (context, name) => {}

const destroy = async (_context, id) => {}

const all = async () => {}

const schema = {
  fields: Joi.object(),
  sys: Joi.object(),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

const plan = async (context, { id, fields }) => {
  // const currentResource = await read(context, id)
  let currentResource
  console.log({ context })

  if (!currentResource) {
    return {
      currentState: ``,
      describe: `Create Contentful entry for "${context.ContentfulType.name}"`,
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

const message = resource => `Created Contentful Entry "${resource.name}"`

export { schema, validate, plan, create, create as update, read, destroy, all }
