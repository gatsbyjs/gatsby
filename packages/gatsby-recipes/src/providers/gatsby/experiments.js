import fs from "fs-extra"
import path from "path"
import { transform } from "@babel/core"
import * as t from "@babel/types"
import { declare } from "@babel/helper-plugin-utils"
import * as Joi from "@hapi/joi"
import prettier from "prettier"

import lock from "../lock"
import getDiff from "../utils/get-diff"
import resourceSchema from "../resource-schema"

import isDefaultExport from "./utils/is-default-export"
import getObjectFromNode from "./utils/get-object-from-node"
import { REQUIRES_KEYS } from "./utils/constants"
const template = require(`@babel/template`)
console.log({ template, ast: template.default.ast })

const setExperiments = (src, experiments) => {
  console.log({ experiments, src })
  const setExperiment = new BabelPluginSetExperiment({
    experiments,
  })

  const { code } = transform(src, {
    plugins: [setExperiment.plugin],
    configFile: false,
  })

  return code
}

const removeExperiment = (src, experiment) => {
  const setExperiment = new BabelPluginSetExperiment({
    name,
  })

  const { code } = transform(src, {
    plugins: [setExperiment.plugin],
    configFile: false,
  })

  return code
}

const getExperiments = src => {
  const getExperiments = new BabelPluginGetExperiments()

  transform(src, {
    plugins: [getExperiments.plugin],
    configFile: false,
  })

  return getExperiments.state
}

const getConfigPath = root => path.join(root, `gatsby-config.js`)

const readConfigFile = async root => {
  let src
  try {
    src = await fs.readFile(getConfigPath(root), `utf8`)
  } catch (e) {
    if (e.code === `ENOENT`) {
      src = `/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: [],
}`
    } else {
      throw e
    }
  }

  return src
}

const create = async ({ root }, experiments) => {
  const release = await lock(`gatsby-config.js`)
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  console.log({ experiments })
  let code = setExperiments(configSrc, experiments)
  code = prettier.format(code, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(getConfigPath(root), code)

  const resource = await read({ root }, name)
  release()
  return resource
}

const read = async ({ root }, id) => {
  try {
    const configSrc = await readConfigFile(root)

    const experiments = getExperiments(configSrc)

    if (!experiments) {
      return undefined
    }

    return {
      id,
      name: id,
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const destroy = async ({ root }, resource) => {
  const configSrc = await readConfigFile(root)

  const newSrc = removeExperiment(configSrc, resource)

  await fs.writeFile(getConfigPath(root), newSrc)
}

class BabelPluginSetExperiment {
  constructor({ experiments }) {
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExpressionStatement(path) {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            let experimentsExist = false
            const experimentsNode = right.properties.find(
              p => p.key.name === `__experiments`
            )

            let experimentsArray = []
            if (experimentsNode?.value) {
              experimentsExist = true
              experimentsArray = getObjectFromNode(experimentsNode?.value)
            }
            const stringified = JSON.stringify(experiments, null, 2)
            console.log({ experimentsExist, experimentsArray, stringified })

            const valueType = typeof value
            const shouldParse =
              valueType !== `string` && valueType !== `undefined`
            // const newExperimentsArray = {
            // ...experiments,
            // }

            console.log(template.default.ast)
            const newExperimentsTemplate = template.default.ast(`
              const foo = ${JSON.stringify(experiments, null, 2)}
            `)

            const newExperiments = newExperimentsTemplate.declarations[0].init

            if (experimentsExist) {
              right.properties = right.properties.map(p => {
                if (p.key.name !== `__experiments`) return p

                return {
                  ...p,
                  value: newExperiments,
                }
              })
            } else {
              right.properties.unshift(
                t.objectProperty(t.identifier(`__experiments`), newExperiments)
              )
            }

            path.stop()
          },
        },
      }
    })
  }
}

class BabelPluginGetExperiments {
  constructor() {
    this.state = {}

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExpressionStatement: path => {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            const siteMetadata = right.properties.find(
              p => p.key.name === `siteMetadata`
            )

            if (!siteMetadata || !siteMetadata.value) return

            this.state = getObjectFromNode(siteMetadata.value)
          },
        },
      }
    })
  }
}

export { setExperiments, getExperiments, removeExperiment }

export { create, create as update, read, destroy }

export const config = {}

export const all = async ({ root }) => {
  const configSrc = await readConfigFile(root)
  const experiments = getExperiments(configSrc)

  return Object.keys(siteMetadata).map(key => {
    return {
      name: key,
    }
  })
}

const schema = {
  name: Joi.string(),
  ...resourceSchema,
}

const validate = resource => {
  if (REQUIRES_KEYS.includes(resource.name) && !resource.key) {
    return {
      error: `${resource.name} requires a key to be set`,
    }
  }

  if (resource.key && resource.key === resource.name) {
    return {
      error: `${resource.name} requires a key to be different than the plugin name`,
    }
  }

  return Joi.validate(resource, schema, { abortEarly: false })
}

export { schema, validate }

export const plan = async ({ root }, experiments) => {
  const prettierConfig = await prettier.resolveConfig(root)
  let configSrc = await readConfigFile(root)
  configSrc = prettier.format(configSrc, {
    ...prettierConfig,
    parser: `babel`,
  })
  console.log({ experiments })

  let newContents = setExperiments(configSrc, experiments)
  newContents = prettier.format(newContents, {
    ...prettierConfig,
    parser: `babel`,
  })
  const diff = await getDiff(configSrc, newContents)
  console.log(newContents, diff)

  return {
    id: fullName,
    name,
    diff,
    currentState: configSrc,
    newState: newContents,
    describe: `Add experiment ${name} to gatsby-config.js`,
  }
}
