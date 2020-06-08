const fs = require(`fs-extra`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const Joi = require(`@hapi/joi`)
const isUrl = require(`is-url`)
const fetch = require(`node-fetch`)
const isBinaryPath = require(`is-binary-path`)

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)

const makePath = (root, relativePath) => path.join(root, relativePath)

const fileExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const downloadFile = async (url, filePath) =>
  fetch(url).then(
    res =>
      new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(filePath)
        res.body.pipe(dest)
        dest.on(`finish`, () => {
          resolve(true)
        })
        dest.on(`error`, reject)
      })
  )

const create = async ({ root }, { id, path: filePath, content }) => {
  const fullPath = makePath(root, filePath)
  const { dir } = path.parse(fullPath)

  await mkdirp(dir)

  if (isUrl(content)) {
    await downloadFile(content, fullPath)
  } else {
    await fs.ensureFile(fullPath)
    await fs.writeFile(fullPath, content)
  }

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

  const resource = { id, path: id, content }
  resource._message = message(resource)
  return resource
}

const destroy = async (context, fileResource) => {
  const fullPath = makePath(context.root, fileResource.id)
  await fs.unlink(fullPath)
  return fileResource
}

// TODO pass action to plan
module.exports.plan = async (context, { id, path: filePath, content }) => {
  let currentResource
  if (!isBinaryPath(filePath)) {
    currentResource = await read(context, filePath)
  } else {
    currentResource = `Binary file`
  }

  let newState = content
  if (isUrl(content)) {
    if (!isBinaryPath(filePath)) {
      const res = await fetch(content)
      newState = await res.text()
    } else {
      newState = `Binary file`
    }
  }

  const plan = {
    currentState: (currentResource && currentResource.content) || ``,
    newState,
    describe: `Write ${filePath}`,
    diff: ``,
  }

  if (plan.currentState !== plan.newState) {
    plan.diff = await getDiff(plan.currentState, plan.newState)
  }

  return plan
}

const message = resource => `Wrote file ${resource.path}`

const schema = {
  path: Joi.string(),
  content: Joi.string(),
  ...resourceSchema,
}
exports.schema = schema
exports.validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

module.exports.exists = fileExists

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
