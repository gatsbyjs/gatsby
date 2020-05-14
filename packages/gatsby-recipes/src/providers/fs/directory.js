const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)

const resourceSchema = require(`../resource-schema`)

const makePath = (root, relativePath) => path.join(root, relativePath)

const directoryExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { id, path: directoryPath }) => {
  const fullPath = makePath(root, directoryPath)
  await fs.ensureDir(fullPath)
  return await read({ root }, directoryPath)
}

const update = async (context, resource) => {
  const fullPath = makePath(context.root, resource.id)
  await fs.ensureDir(fullPath)
  return await read(context, resource.id)
}

const read = async (context, id) => {
  const fullPath = makePath(context.root, id)

  if (!directoryExists(fullPath)) {
    return undefined
  }

  const resource = { id, path: id }
  resource._message = message(resource)
  return resource
}

const destroy = async (context, directoryResource) => {
  const fullPath = makePath(context.root, directoryResource.id)
  await fs.rmdirSync(fullPath)
  return directoryResource
}

module.exports.plan = async (context, { id, path: directoryPath }) => {
  let newState = directoryPath

  const plan = {
    newState,
    describe: `Create ${directoryPath}`,
  }

  return plan
}

const message = resource => `Creating directory ${resource.path}`

const schema = {
  path: Joi.string(),
  content: Joi.string(),
  ...resourceSchema,
}
exports.schema = schema
exports.validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
