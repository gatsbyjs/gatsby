const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)
const isBinaryPath = require(`is-binary-path`)

const getDiff = require(`../utils/get-diff`)
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

// TODO pass action to plan
module.exports.plan = async (context, { id, path: directoryPath }) => {
  let currentResource
  if (!isBinaryPath(directoryPath)) {
    currentResource = await read(context, directoryPath)
  } else {
    currentResource = `Binary file`
  }

  let newState = directoryPath

  const plan = {
    currentState: (currentResource && currentResource.content) || ``,
    newState,
    describe: `Create ${directoryPath}`,
    diff: ``,
  }

  if (plan.currentState !== plan.newState) {
    plan.diff = await getDiff(plan.currentState, plan.newState)
  }

  return plan
}

const message = resource => `Created directory ${resource.path}`

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
