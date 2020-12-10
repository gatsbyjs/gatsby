import fs from "fs-extra"
import path from "path"
import * as Joi from "@hapi/joi"
import singleTrailingNewline from "single-trailing-newline"

import getDiff from "../utils/get-diff"
import resourceSchema from "../resource-schema"

const makePath = root => path.join(root, `.gitignore`)

const gitignoresAsArray = async root => {
  const fullPath = makePath(root)

  if (!fileExists(fullPath)) {
    return []
  }

  const ignoresStr = await fs.readFile(fullPath, `utf8`)
  const ignores = ignoresStr.split(`\n`)
  const last = ignores.pop()

  if (last.trim() === ``) {
    return ignores
  } else {
    return [...ignores, last]
  }
}

const ignoresToString = ignores =>
  singleTrailingNewline(ignores.map(n => n.name).join(`\n`))

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

  const result = await read({ root }, name)
  return result
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

  const name = ignores.find(n => n === id)

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
export const plan = async (context, args) => {
  const name = args.id || args.name

  const currentResource = (await all(context, args)) || []
  const alreadyIgnored = currentResource.find(n => n.id === name)

  const contents = ignoresToString(currentResource)

  const plan = {
    currentState: contents,
    newState: alreadyIgnored ? contents : contents + name,
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

export const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

export { schema, create, update, read, destroy, all }
