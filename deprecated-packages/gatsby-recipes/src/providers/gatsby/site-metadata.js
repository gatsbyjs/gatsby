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
import template from "@babel/template"

const addFieldToSiteMetadata = (src, { name, value }) => {
  const setSiteMetadata = new BabelPluginSetSiteMetadataField({
    key: name,
    value,
  })

  const { code } = transform(src, {
    plugins: [setSiteMetadata.plugin],
    configFile: false,
  })

  return code
}

const removeFieldFromSiteMetadata = (src, { name }) => {
  const setSiteMetadata = new BabelPluginSetSiteMetadataField({
    key: name,
    value: undefined,
  })

  const { code } = transform(src, {
    plugins: [setSiteMetadata.plugin],
    configFile: false,
  })

  return code
}

const getSiteMetdataFromConfig = src => {
  const getSiteMetadata = new BabelPluginGetSiteMetadataFromConfig()

  transform(src, {
    plugins: [getSiteMetadata.plugin],
    configFile: false,
  })

  return getSiteMetadata.state
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
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
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

const create = async ({ root }, { name, value }) => {
  const release = await lock(`gatsby-config.js`)
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  let code = addFieldToSiteMetadata(configSrc, { name, value })
  code = prettier.format(code, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(getConfigPath(root), code)

  const resource = await read({ root }, name)
  release()
  return resource
}

const read = async ({ root }, id) => {
  try {
    const configSrc = await readConfigFile(root)

    const siteMetadata = getSiteMetdataFromConfig(configSrc)

    if (!siteMetadata || typeof siteMetadata[id] === `undefined`) {
      return undefined
    }

    return {
      id,
      name: id,
      value: JSON.stringify(siteMetadata[id]),
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const destroy = async ({ root }, resource) => {
  const configSrc = await readConfigFile(root)

  const newSrc = removeFieldFromSiteMetadata(configSrc, resource)

  await fs.writeFile(getConfigPath(root), newSrc)
}

class BabelPluginSetSiteMetadataField {
  constructor({ key, value }) {
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

            let siteMetadataExists = false
            const siteMetadata = right.properties.find(
              p => p.key.name === `siteMetadata`
            )

            let siteMetadataObj = {}
            if (siteMetadata?.value) {
              siteMetadataExists = true
              siteMetadataObj = getObjectFromNode(siteMetadata?.value)
            }

            const valueType = typeof value
            const shouldParse =
              valueType !== `string` && valueType !== `undefined`
            const newSiteMetadataObj = {
              ...siteMetadataObj,
              [key]: shouldParse ? JSON.parse(value) : value,
            }

            const newSiteMetadataTemplate = template(`
              const foo = ${JSON.stringify(newSiteMetadataObj, null, 2)}
            `)()

            const newSiteMetadata = newSiteMetadataTemplate.declarations[0].init

            if (siteMetadataExists) {
              right.properties = right.properties.map(p => {
                if (p.key.name !== `siteMetadata`) return p

                return {
                  ...p,
                  value: newSiteMetadata,
                }
              })
            } else {
              right.properties.unshift(
                t.objectProperty(t.identifier(`siteMetadata`), newSiteMetadata)
              )
            }

            path.stop()
          },
        },
      }
    })
  }
}

class BabelPluginGetSiteMetadataFromConfig {
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

export {
  addFieldToSiteMetadata,
  getSiteMetdataFromConfig,
  removeFieldFromSiteMetadata,
}

export { create, create as update, read, destroy }

export const config = {}

export const all = async ({ root }) => {
  const configSrc = await readConfigFile(root)
  const siteMetadata = getSiteMetdataFromConfig(configSrc)

  return Object.keys(siteMetadata).map(key => {
    return {
      name: key,
      value: JSON.stringify(siteMetadata[key]),
    }
  })
}

const schema = {
  value: Joi.string(),
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

export const plan = async ({ root }, { id, key, name, value }) => {
  const fullName = id || name
  const prettierConfig = await prettier.resolveConfig(root)
  let configSrc = await readConfigFile(root)
  configSrc = prettier.format(configSrc, {
    ...prettierConfig,
    parser: `babel`,
  })

  let newContents = addFieldToSiteMetadata(configSrc, {
    name: fullName,
    value,
  })
  newContents = prettier.format(newContents, {
    ...prettierConfig,
    parser: `babel`,
  })
  const diff = await getDiff(configSrc, newContents)

  return {
    id: fullName,
    name,
    diff,
    currentState: configSrc,
    newState: newContents,
    describe: `Add ${fullName}: ${value} to the siteMetadata`,
  }
}
