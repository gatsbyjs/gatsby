const fs = require(`fs-extra`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Joi = require(`@hapi/joi`)

const makePath = (root, relativePath) => path.join(root, relativePath)

const fileExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { id, path: filePath, content }) => {
  const fullPath = makePath(root, filePath)
  const { dir } = path.parse(fullPath)

  await mkdirp(dir)

  await fs.writeFile(fullPath, content)

  return await read({ root }, filePath)
}

const update = async (context, resource) => {
  const fullPath = makePath(context.root, resource.id)
  await fs.writeFile(fullPath, resource.content)
  return await read(context, resource.id)
}

const read = async (context, id) => {
  const fullPath = makePath(context.root, id)

  let content = ``
  if (fileExists(fullPath)) {
    content = await fs.readFile(fullPath, `utf8`)
  } else {
    return undefined
  }

  return { id, path: id, content }
}

const destroy = async (context, fileResource) => {
  const fullPath = makePath(context.root, fileResource.id)
  await fs.unlink(fullPath)
  return fileResource
}

// TODO pass action to plan
module.exports.plan = async (context, { id, path: filePath, content }) => {
  let fullPath
  if (!id) {
    fullPath = path.join(context.root, filePath)
    fullPath = makePath(context.root, filePath)
  } else {
    fullPath = makePath(context.root, id)
  }
  const currentResource = await read(context, fullPath)

  return {
    currentState: currentResource && currentResource.content,
    newState: content,
    describe: `Write ${filePath}`,
  }
}

exports.validate = () => {
  return {
    path: Joi.string(),
    content: Joi.string(),
  }
}

module.exports.exists = fileExists

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
