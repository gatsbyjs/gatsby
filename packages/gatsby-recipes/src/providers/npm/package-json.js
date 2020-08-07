const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)
const getDiff = require(`../utils/get-diff`)

const resourceSchema = require(`../resource-schema`)

class Deferred {
  constructor(name) {
    this._promise = new Promise((resolve, reject) => {
      // assign the resolve and reject functions to `this`
      // making them usable on the class instance
      this.resolve = resolve
      this.reject = reject
    })
    this.name = name
    // bind `then` and `catch` to implement the same interface as Promise
    this.then = this._promise.then.bind(this._promise)
    this.catch = this._promise.catch.bind(this._promise)
    this[Symbol.toStringTag] = `Promise`
  }
}
let writesQueue = new Map()
let paused = false
const checkWritesQueue = async root =>
  new Promise((resolve, reject) => {
    setTimeout(async () => {
      if (writesQueue.size > 0) {
        await processWritesQueue(root)
        resolve()
      } else {
        paused = false
      }
    }, 100)
  })

const processWritesQueue = async root => {
  const toProcess = [...writesQueue.entries()]
  writesQueue = new Map()
  const pkg = await readPackageJson(root)
  toProcess.forEach(change => {
    pkg[change[0]] = change[1].value
  })

  await writePackageJson(root, pkg)
  toProcess.forEach(change => {
    change[1].dfd.resolve()
  })
  await checkWritesQueue(root)
}

const enqueueWrite = (root, change) => {
  const dfd = new Deferred(change[0])
  writesQueue.set(change[0], { value: change[1], dfd })

  // If we're not paused, write immediately
  if (!paused) {
    paused = true
    processWritesQueue(root)
  }

  return dfd
}

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
  await enqueueWrite(root, [name, value])

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
    _message: `Wrote key "${id}" to package.json`,
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
const validate = resource => {
  // value can be both a string or an object. Internally we
  // always just treat it as a string to simplify handling it.
  resource.value = JSON.stringify(resource.value)
  return Joi.validate(resource, schema, { abortEarly: false })
}

exports.schema = schema
exports.validate = validate

module.exports.plan = async ({ root }, { id, name, value }) => {
  const key = id || name
  const currentState = await readPackageJson(root)
  const newState = { ...currentState, [key]: value }
  const diff = await getDiff(currentState, newState)

  return {
    id: key,
    name,
    currentState: JSON.stringify(currentState, null, 2),
    newState: JSON.stringify(newState, null, 2),
    describe: `Add ${key} to package.json`,
    diff,
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
