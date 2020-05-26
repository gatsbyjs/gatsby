const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)

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

const create = async ({ root }, { name, value }) => {
  const pkg = await readPackageJson(root)
  pkg[name] = typeof value === `string` ? JSON.parse(value) : value

  await writePackageJson(root, pkg)

  return await read({ root }, name)
}

const read = async ({ root }, id) => {
  const pkg = await readPackageJson(root)

  if (!pkg[id]) {
    return undefined
  }

  return {
    id,
    name: id,
    value: JSON.stringify(pkg[id], null, 2),
  }
}

const destroy = async ({ root }, { id }) => {
  const pkg = await readPackageJson(root)
  delete pkg[id]
  await writePackageJson(root, pkg)
}

const schema = {
  name: Joi.string(),
  value: Joi.string(),
  ...resourceSchema,
}
const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

exports.schema = schema
exports.validate = validate

module.exports.plan = async ({ root }, { id, name, value }) => {
  const parsedValue = typeof value === `string` ? JSON.parse(value) : value
  const key = id || name
  const currentState = readPackageJson(root)
  const newState = { ...currentState, [key]: parsedValue }

  return {
    id: key,
    name,
    currentState: JSON.stringify(currentState, null, 2),
    newState: JSON.stringify(newState, null, 2),
    describe: `Add ${key} to package.json`,
    diff: ``, // TODO: Make diff
  }
}

module.exports.all = async ({ root }) => {
  const pkg = await readPackageJson(root)

  return Object.keys(pkg).map(key => {
    return {
      name: key,
      value: JSON.stringify(pkg[key]),
    }
  })
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  serial: true,
}
