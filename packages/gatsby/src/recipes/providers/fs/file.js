const fs = require(`fs-extra`)
const path = require(`path`)
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

const create = async ({ root }, { path: filePath, content }) => {
  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  await mkdirp(dir)
  await fs.writeFile(fullPath, content)
}

const update = create

const read = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  const content = await fs.readFile(fullPath, `utf8`)

  return { content }
}

const destroy = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  await fs.unlink(fullPath)
}

module.exports.exists = fileExists

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
