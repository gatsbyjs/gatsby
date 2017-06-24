const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const _ = require(`lodash`)
const crypto = require(`crypto`)
const babylon = require('babylon')
const traverse = require('babel-traverse').default

async function onCreateNode({ node, getNode, boundActionCreators, loadNodeContent }) {
  const { createNode, createParentChildLink } = boundActionCreators

  // Don't reprocess our own nodes!  (note: this doesn't normally happen
  // but since this transformer creates new nodes with the same media-type
  // as its parent node, we have to add this check that we didn't create
  // the node).
  if (node.internal.owner === `gatsby-transformer-js`) {
    return
  }

  // This only processes javascript files.
  if (node.internal.mediaType !== `application/javascript`) {
    return
  }

  const code = await loadNodeContent(node)
  const options = {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    plugins: [
      'jsx',
      'doExpressions',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'asyncGenerators',
      'functionBind',
      'functionSent',
      'dynamicImport',
      'flow',
    ],
  }

  let exportsData, data
  try {
    const ast = babylon.parse(code, options)

    const parseData = function parseData(node) {
      let value

      if (node.type === 'TemplateLiteral') {
        // Experimental basic support for template literals:
        // Extract and join any text content; ignore interpolations
        value = node.quasis.map(quasi => quasi.value.cooked).join('')
      } else if (node.type === 'ObjectExpression') {
        value = {}
        node.properties.forEach(elem => {
          value[elem.key.name] = parseData(elem.value)
        })
      } else if (node.type === 'ArrayExpression') {
        value = node.elements.map(elem => parseData(elem))
      } else {
        value = node.value
      }

      return value
    }

    data = {}
    traverse(ast, {
      AssignmentExpression: function AssignmentExpression(astPath) {
        if (
          astPath.node.left.type === 'MemberExpression' &&
          astPath.node.left.property.name === 'data'
        ) {
          astPath.node.right.properties.forEach(node => {
            data[node.key.name] = parseData(node.value)
          })
        }
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
        const { declaration } = astPath.node
        if (declaration && declaration.type === 'VariableDeclaration') {
          const dataVariableDeclarator = _.find(
            declaration.declarations,
            d => d.id.name === 'data'
          )

          if (dataVariableDeclarator && dataVariableDeclarator.init) {
            dataVariableDeclarator.init.properties.forEach(node => {
              data[node.key.name] = parseData(node.value)
            })
          }
        }
      },
    })

    exportsData = {
      // We may eventually add other data besides just
      // from exports.data
      data: {...data},
      JSFrontmatter: `filled`
    }

  } catch (e) {
    // Ignore errors — we print out parse errors for user elsewhere.
    exportsData = {
      data: {...data},
      JSFrontmatter: `error`
    }
  } finally {

    const objStr = JSON.stringify(node)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)

    const nodeData = {
          id: `${node.id} >>> JSFrontmatter`,
          children: [],
          parent: node.id,
          node: {...node},
          internal: {
            contentDigest,
            type: `JSFrontmatter`,
            owner: `gatsby-transformer-js`,
            mediaType: `application/javascript`,
          },
        }

    nodeData.exportsData = {...exportsData}

    if (node.internal.type === `File`) {
      nodeData.fileAbsolutePath = node.absolutePath
    }

    createNode(nodeData)
    createParentChildLink({ parent: node, child: nodeData })

    return
  }
}

exports.onCreateNode = onCreateNode
