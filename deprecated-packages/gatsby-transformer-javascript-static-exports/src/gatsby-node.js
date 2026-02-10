const _ = require(`lodash`)
const babylon = require(`@babel/parser`)
const traverse = require(`@babel/traverse`).default

function shouldOnCreateNode({ node }) {
  // This only processes JavaScript files.
  return node.internal.mediaType === `application/javascript`
}

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  const code = await loadNodeContent(node)
  const options = {
    sourceType: `unambigious`,
    allowImportExportEverywhere: true,
    plugins: [
      `jsx`,
      `flow`,
      `doExpressions`,
      `objectRestSpread`,
      [
        `decorators`,
        {
          decoratorsBeforeExport: true,
        },
      ],
      `classProperties`,
      `classPrivateProperties`,
      `classPrivateMethods`,
      `exportDefaultFrom`,
      `exportNamespaceFrom`,
      `asyncGenerators`,
      `functionBind`,
      `functionSent`,
      `dynamicImport`,
      `numericSeparator`,
      `optionalChaining`,
      `importMeta`,
      `bigInt`,
      `optionalCatchBinding`,
      `throwExpressions`,
      `pipelineOperator`,
      `nullishCoalescingOperator`,
    ],
  }

  let exportsData
  let data
  try {
    const ast = babylon.parse(code, options)

    const parseData = function parseData(node) {
      let value

      if (node.type === `TemplateLiteral`) {
        // Experimental basic support for template literals:
        // Extract and join any text content; ignore interpolations
        value = node.quasis.map(quasi => quasi.value.cooked).join(``)
      } else if (node.type === `ObjectExpression`) {
        value = {}
        node.properties.forEach(elem => {
          value[elem.key.name] = parseData(elem.value)
        })
      } else if (node.type === `ArrayExpression`) {
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
          astPath.node.left.type === `MemberExpression` &&
          astPath.node.left.property.name === `data`
        ) {
          astPath.node.right.properties.forEach(node => {
            data[node.key.name] = parseData(node.value)
          })
        }
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
        const { declaration } = astPath.node
        if (declaration && declaration.type === `VariableDeclaration`) {
          const dataVariableDeclarator = _.find(
            declaration.declarations,
            d => d.id.name === `data`
          )

          if (dataVariableDeclarator && dataVariableDeclarator.init) {
            dataVariableDeclarator.init.properties.forEach(node => {
              data[node.key.name] = parseData(node.value)
            })
          }
        }
      },
    })

    // We may eventually add other data besides just
    // from exports.data. Each set of exports should have its
    // own object to track errors separately. Add below as noted.
    exportsData = {
      ...data,
      error: false,
    }
  } catch (e) {
    // stick the error on the query so the user can
    // react to an error as they see fit
    exportsData = {
      ...data,
      error: {
        err: true,
        code: e.code,
        message: e.message,
        stack: e.stack,
      },
    }
  } finally {
    const contentDigest = createContentDigest(node)
    const nodeData = {
      id: createNodeId(`${node.id} >>> JSFrontmatter`),
      children: [],
      parent: node.id,
      node: { ...node },
      internal: {
        contentDigest,
        type: `JSFrontmatter`,
      },
    }

    nodeData.data = { ...exportsData }
    // eventually add additional exports here

    if (node.internal.type === `File`) {
      nodeData.fileAbsolutePath = node.absolutePath
    }

    createNode(nodeData)
    createParentChildLink({ parent: node, child: nodeData })
  }
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
