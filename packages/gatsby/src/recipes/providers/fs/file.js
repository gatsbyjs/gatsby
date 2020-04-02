const fs = require(`fs`)
const path = require(`path`)
const { promisify } = require(`util`)
const mkdirp = require(`mkdirp`)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const destroyFile = promisify(fs.unlink)

const fileExists = ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { path: filePath, content, overwrite }) => {
  const fullPath = path.join(root, filePath)
  const { dir } = path.parse(fullPath)

  const alreadyExists = await fileExists({ root }, { path: filePath })

  if (alreadyExists && !overwrite) {
    return
  }

  await mkdirp(dir)
  await writeFile(fullPath, content)
}

const update = (context, cmd) => create(context, { ...cmd, overwrite: true })

const read = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  const content = await readFile(fullPath, `utf8`)

  return { content }
}

const destroy = async ({ root }, { path: filePath }) => {
  const fullPath = path.join(root, filePath)
  await destroyFile(fullPath)
}

module.exports.exists = fileExists

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
