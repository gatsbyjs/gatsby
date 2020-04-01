const path = require(`path`)
const fs = require(`fs`)
const { promisify } = require(`util`)
const mkdirp = require(`mkdirp`)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const destroyFile = promisify(fs.unlink)

const create = async ({ root }, { theme, path: filePath }) => {
  const relativePathInTheme = filePath.replace(theme + `/`, ``)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    relativePathInTheme
  )

  const contents = await readFile(fullFilePathToShadow, `utf8`)

  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  await mkdirp(dir)
  await writeFile(fullPath, contents)
}

const read = async ({ root }, { theme, path: filePath }) => {
  const relativePathInTheme = filePath.replace(theme + `/`, ``)
  const fullFilePathToShadow = path.join(
    root,
    `node_modules`,
    theme,
    relativePathInTheme
  )

  const contents = await readFile(fullFilePathToShadow, `utf8`)
  return contents
}

const destroy = async ({ root }, { theme, path: filePath }) => {
  const fullPath = path.join(root, filePath)
  await destroyFile(fullPath)
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
