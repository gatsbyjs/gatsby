const fs = require(`fs`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)
const { promisify } = require(`util`)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const readPackageJson = async root => {
  const fullPath = path.join(root, `package.json`)
  const contents = await readFile(fullPath, `utf8`)
  const obj = JSON.parse(contents)
  return obj
}

const writePackageJson = async (root, obj) => {
  const fullPath = path.join(root, `package.json`)
  const contents = JSON.stringify(obj, null, 2)
  await writeFile(fullPath, contents)
}

const create = async ({ root }, { name, command }) => {
  const pkg = await readPackageJson(root)
  pkg.scripts = pkg.scripts || {}
  pkg.scripts[name] = command
  await writePackageJson(root, pkg)

  return await read({ root }, name)
}

const read = async ({ root }, id) => {
  const pkg = await readPackageJson(root)

  if (pkg.scripts && pkg.scripts[id]) {
    return {
      id,
      name: id,
      command: pkg.scripts[id],
    }
  }

  return undefined
}

const destroy = async ({ root }, { name }) => {
  const pkg = await readPackageJson(root)
  pkg.scripts = pkg.scripts || {}
  delete pkg.scripts[name]
  await writePackageJson(root, pkg)
}

module.exports.validate = () => {
  return {
    name: Joi.string(),
    command: Joi.string(),
  }
}

module.exports.all = async ({ root }) => {
  const pkg = await readPackageJson(root)
  const scripts = pkg.scripts || {}

  return Object.entries(scripts).map(arr => {
    return { name: arr[0], command: arr[1] }
  })
}

module.exports.plan = async ({ root }, { name, command }) => {
  const resource = await read({ root }, name)

  const scriptDescription = (name, command) => `"${name}": "${command}`

  let currentState = ``
  if (resource) {
    currentState = scriptDescription(resource.name, resource.command)
  }
  return {
    currentState,
    newState: scriptDescription(name, command),
    describe: `Add new command to your package.json — ${scriptDescription(
      name,
      command
    )}`,
  }
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  serial: true,
}
