import fs from "fs-extra"
import path from "path"
import * as Joi from "@hapi/joi"
import getDiff from "../utils/get-diff"
import lock from "../lock"

import resourceSchema from "../resource-schema"

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
  const release = await lock(`package.json`)
  const pkg = await readPackageJson(root)
  pkg[name] = value

  await writePackageJson(root, pkg)

  const newPkg = await read({ root }, name)

  release()
  return newPkg
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

export { schema, validate }

export const plan = async ({ root }, { id, name, value }) => {
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

export const all = async ({ root }) => {
  const pkg = await readPackageJson(root)

  return Object.keys(pkg).map(key => {
    return {
      name: key,
      value: JSON.stringify(pkg[key]),
    }
  })
}

export { create, create as update, read, destroy }

export const config = {
  serial: true,
}
