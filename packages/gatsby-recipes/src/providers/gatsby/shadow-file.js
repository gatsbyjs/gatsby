const path = require(`path`)
const fs = require(`fs-extra`)
const Joi = require(`@hapi/joi`)

const { slash } = require(`gatsby-core-utils`)

const resourceSchema = require(`../resource-schema`)
const getDiff = require(`../utils/get-diff`)
const fileExists = filePath => fs.existsSync(filePath)

const relativePathForShadowedFile = ({ theme, filePath }) => {
  // eslint-disable-next-line
  const [_src, ...filePathParts] = filePath.split(`/`)
  const relativePath = path.join(`src`, theme, path.join(...filePathParts))
  return slash(relativePath)
}

exports.relativePathForShadowedFile = relativePathForShadowedFile

const createPathToThemeFile = ({ root, theme, filePath }) => {
  // eslint-disable-next-line
  const fullPath = path.join(root, `node_modules`, theme, filePath)
  return slash(fullPath)
}
exports.createPathToThemeFile = createPathToThemeFile

const splitId = id => {
  // Remove src
  // eslint-disable-next-line
  const [_src, ...filePathParts] = id.split(`/`)
  let theme
  let filePath
  // Check if npm package is scoped
  if (filePathParts[0][0] === `@`) {
    theme = path.join(filePathParts[0], filePathParts[1])
    filePath = path.join(...filePathParts.slice(2))
  } else {
    theme = filePathParts[0]
    filePath = path.join(...filePathParts.slice(1))
  }
  return {
    theme: slash(theme),
    filePath: slash(filePath),
  }
}
exports.splitId = splitId

const create = async ({ root }, { theme, path: filePath }) => {
  const id = relativePathForShadowedFile({ filePath, theme })

  const fullFilePathToShadow = createPathToThemeFile({ root, theme, filePath })

  const contents = await fs.readFile(fullFilePathToShadow, `utf8`)

  const shadowedFilePath = path.join(root, id)

  await fs.ensureFile(shadowedFilePath)
  await fs.writeFile(shadowedFilePath, contents)

  const result = await read({ root }, id)
  return result
}

const read = async ({ root }, id) => {
  // eslint-disable-next-line
  const { theme, filePath } = splitId(id)

  const shadowedFilePath = path.join(root, id)

  if (!fileExists(shadowedFilePath)) {
    return undefined
  }

  const contents = await fs.readFile(shadowedFilePath, `utf8`)

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
    id = relativePathForShadowedFile({ theme, filePath })
  }

  currentResource = (await read({ root }, id)) || {}

  // eslint-disable-next-line
  const fullFilePathToShadow = path.join(root, `node_modules`, theme, filePath)

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
