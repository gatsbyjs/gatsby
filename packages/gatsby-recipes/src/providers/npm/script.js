const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)
const readPackageJson = async root => {
  const fullPath = path.join(root, `package.json`)
  const contents = await fs.readFile(fullPath, `utf8`)
  const obj = JSON.parse(contents)
  return obj
}

const writePackageJson = async (root, obj) => {
  const fullPath = path.join(root, `package.json`)
  const contents = JSON.stringify(obj, null, 2)
  await fs.writeFile(fullPath, contents)
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
      _message: `Added script "${id}" to your package.json`,
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

const schema = {
  name: Joi.string(),
  command: Joi.string(),
  ...resourceSchema,
}
const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

exports.schema = schema
exports.validate = validate

module.exports.all = async ({ root }) => {
  const pkg = await readPackageJson(root)
  const scripts = pkg.scripts || {}

  return Object.entries(scripts).map(arr => {
    return { name: arr[0], command: arr[1], id: arr[0] }
  })
}

module.exports.plan = async ({ root }, { name, command }) => {
  const resource = await read({ root }, name)

  const pkg = await readPackageJson(root)

  const scriptDescription = (name, command) => `"${name}": "${command}"`

  let currentState = ``
  if (resource) {
    currentState = scriptDescription(resource.name, resource.command)
  }

  const oldState = JSON.parse(JSON.stringify(pkg))
  pkg.scripts = pkg.scripts || {}
  pkg.scripts[name] = command

  const diff = await getDiff(oldState, pkg)
  return {
    currentState,
    newState: scriptDescription(name, command),
    diff,
    describe: `Add script "${name}" to your package.json`,
  }
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  serial: true,
}
