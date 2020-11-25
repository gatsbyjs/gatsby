import fs from "fs-extra"
import path from "path"
import { transform } from "@babel/core"
import * as t from "@babel/types"
import { declare } from "@babel/helper-plugin-utils"
import * as Joi from "@hapi/joi"
import prettier from "prettier"
import _ from "lodash"
import template from "@babel/template"

import lock from "../lock"
import getDiff from "../utils/get-diff"
import resourceSchema from "../resource-schema"

import isDefaultExport from "./utils/is-default-export"
import getObjectFromNode from "./utils/get-object-from-node"
import { REQUIRES_KEYS } from "./utils/constants"

const setExperiment = (src, experimentName) => {
  const setExperiment = new BabelPluginSetExperiment({
    experimentName,
  })

  const { code } = transform(src, {
    plugins: [setExperiment.plugin],
    configFile: false,
  })

  return code
}

const removeExperiment = (src, experimentName) => {
  const setExperiment = new BabelPluginSetExperiment({
    experimentName,
    destroy: true,
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

const create = async ({ root }, { name }) => {
  const release = await lock(`gatsby-config.js`)
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  let code = setExperiment(configSrc, name)
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

    if (_.isEmpty(experiments)) {
      return undefined
    }

    if (experiments && experiments.includes(id)) {
      return {
        id,
        name: id,
      }
    } else {
      return undefined
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const destroy = async ({ root }, { name }) => {
  const release = await lock(`gatsby-config.js`)
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  const newSrc = removeExperiment(configSrc, name)

  const code = prettier.format(newSrc, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(getConfigPath(root), code)

  release()
}

class BabelPluginSetExperiment {
  constructor({ experimentName, destroy = false }) {
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
            if (destroy) {
              experimentsArray = _.without(experimentsArray, experimentName)
            } else {
              experimentsArray = _.uniq(experimentsArray.concat(experimentName))
            }

            const newExperimentsTemplate = template.ast(`
              const foo = ${JSON.stringify(experimentsArray, null, 2)}
            `)

            const newExperiments = newExperimentsTemplate.declarations[0].init

            if (experimentsExist) {
              right.properties = right.properties.map(p => {
                if (p.key.name !== `__experiments`) return p

                // Remove from config altogether if there's no active experiments.
                if (experimentsArray.length > 0) {
                  return {
                    ...p,
                    value: newExperiments,
                  }
                } else {
                  return null
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

            const experiments = right.properties.find(
              p => p.key.name === `__experiments`
            )

            if (!experiments || !experiments.value) return

            this.state = getObjectFromNode(experiments.value)
          },
        },
      }
    })
  }
}

export { setExperiment, getExperiments, removeExperiment }

export { create, create as update, read, destroy }

export const config = {}

export const all = async ({ root }) => {
  const configSrc = await readConfigFile(root)
  const experiments = getExperiments(configSrc)

  if (_.isArray(experiments)) {
    return experiments.map(name => {
      return {
        id: name,
        name,
      }
    })
  } else {
    return []
  }
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

export const plan = async ({ root }, { name }) => {
  const prettierConfig = await prettier.resolveConfig(root)
  let configSrc = await readConfigFile(root)
  configSrc = prettier.format(configSrc, {
    ...prettierConfig,
    parser: `babel`,
  })

  let newContents = setExperiment(configSrc, name)
  newContents = prettier.format(newContents, {
    ...prettierConfig,
    parser: `babel`,
  })
  const diff = await getDiff(configSrc, newContents)

  return {
    id: name,
    name,
    diff,
    currentState: configSrc,
    newState: newContents,
    describe: `Add experiment ${name} to gatsby-config.js`,
  }
}
