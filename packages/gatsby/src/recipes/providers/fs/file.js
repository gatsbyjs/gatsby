const fs = require(`fs`)
const path = require(`path`)
const { promisify } = require(`util`)
const mkdirp = require(`mkdirp`)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const destroyFile = promisify(fs.unlink)

const create = async ({ root }, { path: filePath, content, children }) => {
  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  content = content || children

  await mkdirp(dir)
  await writeFile(fullPath, content)
}

const read = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  const content = await readFile(fullPath, `utf8`)

  return { content }
}

const destroy = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  await destroyFile(fullPath)
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
