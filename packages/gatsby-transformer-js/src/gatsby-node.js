const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

async function onCreateNode({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, createParentChildLink } = boundActionCreators
  console.log(node, node.internal.mediaType)
  if (node.internal.mediaType !== `application/javascript`) {
    return
  }
  console.log(node, node.internal.mediaType)
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

    let data
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
    } catch (e) {
      // Ignore errors — we print out parse errors for user elsewhere.
      console.log(code)
      data = {}
    }


    const objStr = JSON.stringify(node)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)

    const nodeData = {
          id: node.id ? node.id : `${node.id} [${i}] >>> JS`,
          children: [],
          parent: node.id,
          data: data,
          internal: {
            contentDigest,
            // TODO make choosing the "type" a lot smarter. This assumes
            // the parent node is a file.
            // PascalCase
            type: _.upperFirst(_.camelCase(`${node.name} JS`)),
            mediaType: `application/javascript`,
            content: objStr,
          },
        }
    createNode(nodeData)

    return
  }

exports.onCreateNode = onCreateNode
