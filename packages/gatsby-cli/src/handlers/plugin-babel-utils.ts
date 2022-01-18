import * as t from "@babel/types"
import generate from "@babel/generator"
import template from "@babel/template"
import { declare } from "@babel/helper-plugin-utils"

const getKeyNameFromAttribute = (node: any): any =>
  node.key.name || node.key.value

const unwrapTemplateLiteral = (str: string): string =>
  str.trim().replace(/^`/, ``).replace(/`$/, ``)

const isLiteral = (node: any): boolean =>
  t.isLiteral(node) || t.isStringLiteral(node) || t.isNumericLiteral(node)

const getObjectFromNode = (nodeValue: any): any => {
  if (!nodeValue || !nodeValue.properties) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getValueFromNode(nodeValue)
  }

  const props = nodeValue.properties.reduce((acc, curr) => {
    let value = null

    if (curr.value) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      value = getValueFromNode(curr.value)
    } else if (t.isObjectExpression(curr.value)) {
      value = curr.value.expression.properties.reduce((acc, curr) => {
        acc[getKeyNameFromAttribute(curr)] = getObjectFromNode(curr)
        return acc
      }, {})
    } else {
      throw new Error(`Did not recognize ${curr}`)
    }

    acc[getKeyNameFromAttribute(curr)] = value
    return acc
  }, {})

  return props
}

const getValueFromNode = (node: any): any => {
  if (t.isTemplateLiteral(node)) {
    // @ts-ignore - fix me
    delete node.leadingComments
    // @ts-ignore - fix me
    delete node.trailingComments
    // @ts-ignore - fix me
    const literalContents = generate(node).code
    return unwrapTemplateLiteral(literalContents)
  }

  if (isLiteral(node)) {
    return node.value
  }

  if (node.type === `ArrayExpression`) {
    return node.elements.map(getObjectFromNode)
  }

  if (node.type === `ObjectExpression`) {
    return getObjectFromNode(node)
  }

  return null
}

function isDefaultExport(node): boolean {
  if (!node || !t.isMemberExpression(node)) {
    return false
  }

  const { object, property } = node

  if (!t.isIdentifier(object) || object.name !== `module`) return false
  if (!t.isIdentifier(property) || property.name !== `exports`) return false

  return true
}

const getOptionsForPlugin = (node: any): any => {
  if (!t.isObjectExpression(node) && !t.isLogicalExpression(node)) {
    return undefined
  }

  let options

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    // @ts-ignore - fix me
    options = node.right.properties.find(
      property => property.key.name === `options`
    )
  } else {
    // @ts-ignore - fix me
    options = node.properties.find(property => property.key.name === `options`)
  }

  if (options) {
    return getObjectFromNode(options.value)
  }

  return undefined
}

const getKeyForPlugin = (node: any): any => {
  if (t.isObjectExpression(node)) {
    // @ts-ignore - fix me
    const key = node.properties.find(p => p.key.name === `__key`)

    // @ts-ignore - fix me
    return key ? getValueFromNode(key.value) : null
  }

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    // @ts-ignore - fix me
    const key = node.right.properties.find(p => p.key.name === `__key`)

    return key ? getValueFromNode(key.value) : null
  }

  return null
}

const getNameForPlugin = (node: any): any => {
  if (t.isStringLiteral(node) || t.isTemplateLiteral(node)) {
    return getValueFromNode(node)
  }

  if (t.isObjectExpression(node)) {
    // @ts-ignore - fix me
    const resolve = node.properties.find(p => p.key.name === `resolve`)

    // @ts-ignore - fix me
    return resolve ? getValueFromNode(resolve.value) : null
  }

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    // @ts-ignore - fix me
    const resolve = node.right.properties.find(p => p.key.name === `resolve`)

    return resolve ? getValueFromNode(resolve.value) : null
  }

  return null
}

const getPlugin = (node: any): any => {
  const plugin = {
    name: getNameForPlugin(node),
    options: getOptionsForPlugin(node),
  }

  const key = getKeyForPlugin(node)

  if (key) {
    return { ...plugin, key }
  }

  return plugin
}

function buildPluginNode({ name, options, key }): any {
  if (!options && !key) {
    return t.stringLiteral(name)
  }

  const pluginWithOptions = template(
    `
    const foo = {
      resolve: '${name}',
      options: ${JSON.stringify(options, null, 2)},
      ${key ? `__key: "` + key + `"` : ``}
    }
  `,
    { placeholderPattern: false }
  )()

  // @ts-ignore - fix me
  return pluginWithOptions.declarations[0].init
}

export class BabelPluginAddPluginsToGatsbyConfig {
  constructor({ pluginOrThemeName, shouldAdd, options, key }) {
    // @ts-ignore - fix me
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExpressionStatement(path): void {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            const pluginNodes = right.properties.find(
              p => p.key.name === `plugins`
            )

            if (shouldAdd) {
              if (t.isCallExpression(pluginNodes.value)) {
                const plugins =
                  pluginNodes.value.callee.object.elements.map(getPlugin)
                const matches = plugins.filter(plugin => {
                  if (!key) {
                    return plugin.name === pluginOrThemeName
                  }

                  return plugin.key === key
                })

                if (!matches.length) {
                  const pluginNode = buildPluginNode({
                    name: pluginOrThemeName,
                    options,
                    key,
                  })

                  pluginNodes.value.callee.object.elements.push(pluginNode)
                } else {
                  pluginNodes.value.callee.object.elements =
                    pluginNodes.value.callee.object.elements.map(node => {
                      const plugin = getPlugin(node)

                      if (plugin.key !== key) {
                        return node
                      }

                      if (!plugin.key && plugin.name !== pluginOrThemeName) {
                        return node
                      }

                      return buildPluginNode({
                        name: pluginOrThemeName,
                        options,
                        key,
                      })
                    })
                }
              } else {
                const plugins = pluginNodes.value.elements.map(getPlugin)
                const matches = plugins.filter(plugin => {
                  if (!key) {
                    return plugin.name === pluginOrThemeName
                  }

                  return plugin.key === key
                })

                if (!matches.length) {
                  const pluginNode = buildPluginNode({
                    name: pluginOrThemeName,
                    options,
                    key,
                  })

                  pluginNodes.value.elements.push(pluginNode)
                } else {
                  pluginNodes.value.elements = pluginNodes.value.elements.map(
                    node => {
                      const plugin = getPlugin(node)

                      if (plugin.key !== key) {
                        return node
                      }

                      if (!plugin.key && plugin.name !== pluginOrThemeName) {
                        return node
                      }

                      return buildPluginNode({
                        name: pluginOrThemeName,
                        options,
                        key,
                      })
                    }
                  )
                }
              }
            } else {
              if (t.isCallExpression(pluginNodes.value)) {
                pluginNodes.value.callee.object.elements =
                  pluginNodes.value.callee.object.elements.filter(node => {
                    const plugin = getPlugin(node)

                    if (key) {
                      return plugin.key !== key
                    }

                    return plugin.name !== pluginOrThemeName
                  })
              } else {
                pluginNodes.value.elements = pluginNodes.value.elements.filter(
                  node => {
                    const plugin = getPlugin(node)

                    if (key) {
                      return plugin.key !== key
                    }

                    return plugin.name !== pluginOrThemeName
                  }
                )
              }
            }

            path.stop()
          },
        },
      }
    })
  }
}
