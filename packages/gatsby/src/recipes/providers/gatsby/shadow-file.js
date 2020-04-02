const path = require(`path`)
const fs = require(`fs-extra`)
const mkdirp = require(`mkdirp`)

const fileExists = ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { theme, path: filePath }) => {
  const relativePathInTheme = filePath.replace(theme + `/`, ``)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    relativePathInTheme
  )

  const contents = await fs.readFile(fullFilePathToShadow, `utf8`)

  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  if (fileExists({ root }, { path: filePath })) {
    return
  }

  await mkdirp(dir)
  await fs.writeFile(fullPath, contents)
}

const read = async ({ root }, { theme, path: filePath }) => {
  const relativePathInTheme = filePath.replace(theme + `/`, ``)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    relativePathInTheme
  )

  const contents = await fs.readFile(fullFilePathToShadow, `utf8`)
  return contents
}

const destroy = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  await fs.unlink(fullPath)
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
