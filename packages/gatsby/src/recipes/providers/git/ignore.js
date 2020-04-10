const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)
const isBlank = require('is-blank')
const singleTrailingNewline = require('single-trailing-newline')

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)

const makePath = (root, relativePath) => path.join(root, '.gitignore')

const gitignoresAsArray = async root => {
  const fullPath = makePath(root)

  if (fileExists(fullPath)) {
    const ignores = await fs.readFile(fullPath, `utf8`)
    return ignores.split('\n')
  } else {
    return []
  }
}

const ignoresToString = ignores => {
  return singleTrailingNewline(ignores.map(n => n.name).join('\n'))
}

const fileExists = fullPath => {
  try {
    fs.accessSync(fullPath, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

const create = async ({ root }, { name }) => {
  const fullPath = makePath(root)

  let ignores = await all({ root })

  const exists = ignores.find(n => n.id === name)
  if (!exists) {
    ignores.push({ id: name, name })
  }

  await fs.writeFile(fullPath, ignoresToString(ignores))

  console.log(ignores)

  return await read({ root }, name)
}

const update = async ({ root }, { id, name }) => {
  const fullPath = makePath(root)

  let ignores = await all({ root })

  const exists = ignores.find(n => n.id === id)

  if (!exists) {
    ignores.push({ id, name })
  } else {
    ignores = ignores.map(n => {
      if (n.id === id) {
        return { ...n, name }
      }

      return n
    })
  }

  await fs.writeFile(fullPath, ignoresToString(ignores))

  return await read({ root }, name)
}

const read = async (context, id) => {
  const ignores = await gitignoresAsArray(context.root)

  const name = ignores.find(n => n.name === id)

  if (!name) {
    return undefined
  }

  const resource = { id, name }
  resource._message = message(resource)
  return resource
}

const all = async context => {
  const ignores = await gitignoresAsArray(context.root)

  return ignores.map((name, i) => {
    const id = name || i.toString() // Handle newlines
    return { id, name }
  })
}

const destroy = async (context, { id, name }) => {
  const fullPath = makePath(context.root)
  
  const ignores = await all(context)
  const newIgnores = ignores.filter(n => n.id !== id)

  await fs.writeFile(fullPath, ignoresToString(newIgnores))
  
  return { id, name }
}

// TODO pass action to plan
module.exports.plan = async (context, args) => {
  const name = args.id || args.name

  const currentResource = await all(context, args) || []
  const alreadyIgnored = currentResource.find(n => n.id === name)

  const contents = ignoresToString(currentResource)

  const plan = {
    currentState: contents,
    newState: alreadyIgnored ? contents : contents + '\n' + name,
    describe: `Add ${name} to gitignore`,
    diff: ``,
  }

  if (plan.currentState !== plan.newState) {
    plan.diff = await getDiff(plan.currentState, plan.newState)
  }

  return plan
}

const message = resource => `Added ${resource.id || resource.name} to gitignore`

const schema = {
  name: Joi.string(),
  ...resourceSchema,
}
exports.schema = schema
exports.validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
module.exports.all = all
