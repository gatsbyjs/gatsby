const path = require(`path`)
const fs = require(`fs-extra`)
const Joi = require(`@hapi/joi`)

const resourceSchema = require(`../resource-schema`)
const getDiff = require(`../utils/get-diff`)
const fileExists = filePath => fs.existsSync(filePath)

const relativePathForShadowedFile = ({ theme, filePath }) => {
  // eslint-disable-next-line
  const [_src, ...filePathParts] = filePath.split(path.sep)
  const relativePath = path.join(`src`, theme, path.join(...filePathParts))
  return relativePath
}

const create = async ({ root }, { theme, path: filePath }) => {
  const id = relativePathForShadowedFile({ filePath, theme })

  const relativePathInTheme = filePath.replace(theme + path.sep, ``)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    relativePathInTheme
  )

  const contents = await fs.readFile(fullFilePathToShadow, `utf8`)

  const fullPath = path.join(root, id)

  await fs.ensureFile(fullPath)
  await fs.writeFile(fullPath, contents)

  const result = await read({ root }, id)
  return result
}

const read = async ({ root }, id) => {
  // eslint-disable-next-line
  const [_src, theme, ..._filePathParts] = id.split(path.sep)

  const fullPath = path.join(root, id)

  if (!fileExists(fullPath)) {
    return undefined
  }

  const contents = await fs.readFile(fullPath, `utf8`)

  const resource = {
    id,
    theme,
    path: id,
    contents,
  }

  resource._message = message(resource)

  return resource
}

const destroy = async ({ root }, { id }) => {
  const resource = await read({ root }, id)
  await fs.unlink(path.join(root, id))
  return resource
}

const schema = {
  theme: Joi.string(),
  path: Joi.string(),
  contents: Joi.string(),
  ...resourceSchema,
}
module.exports.schema = schema
module.exports.validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy

const message = resource =>
  `Shadowed ${resource.id || resource.path} from ${resource.theme}`

module.exports.plan = async ({ root }, { theme, path: filePath, id }) => {
  let currentResource = ``
  if (!id) {
    // eslint-disable-next-line
    const [_src, ...filePathParts] = filePath.split(path.sep)
    id = path.join(`src`, theme, path.join(...filePathParts))
  }

  currentResource = (await read({ root }, id)) || {}

  // eslint-disable-next-line
  const [_src, _theme, ...shadowPathParts] = id.split(path.sep)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    `src`,
    path.join(...shadowPathParts)
  )

  const newContents = await fs.readFile(fullFilePathToShadow, `utf8`)
  const newResource = {
    id,
    theme,
    path: filePath,
    contents: newContents,
  }

  const diff = await getDiff(currentResource.contents || ``, newContents)

  return {
    id,
    theme,
    path: filePath,
    diff,
    currentState: currentResource,
    newState: newResource,
    describe: `Shadow ${filePath} from the theme ${theme}`,
  }
}
