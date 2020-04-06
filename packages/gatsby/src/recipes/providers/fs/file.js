const fs = require(`fs-extra`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Joi = require(`@hapi/joi`)

const fileExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { id, path: filePath, content }) => {
  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  await mkdirp(dir)

  await fs.writeFile(fullPath, content)

  return await read({ root }, fullPath)
}

const update = async (context, resource) => {
  await fs.writeFile(resource.id, resource.content)
  return await read(context, resource.id)
}

const read = async (context, id) => {
  let content = ``
  if (fileExists(id)) {
    content = await fs.readFile(id, `utf8`)
  }

  return { id, path: id, content }
}

const destroy = async (context, fileResource) => {
  await fs.unlink(fileResource.path)
}

// TODO pass action to plan
module.exports.plan = async (context, { id, path: filePath, content }) => {
  let fullPath
  if (!id) {
    fullPath = path.join(context.root, filePath)
  } else {
    fullPath = id
  }
  const currentResource = await read(context, fullPath)

  return {
    currentState: currentResource.content,
    newState: content,
    describe: `Write ${fullPath}`,
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
