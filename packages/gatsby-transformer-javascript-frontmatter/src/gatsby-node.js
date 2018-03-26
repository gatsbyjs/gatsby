const _ = require(`lodash`)
const crypto = require(`crypto`)
const babylon = require(`babylon`)
const traverse = require(`babel-traverse`).default

async function onCreateNode({ node, getNode, actions, loadNodeContent }) {
  const { createNode, createParentChildLink } = actions

  // This only processes javascript & jsx files.
  if (
    node.internal.mediaType !== `application/javascript` &&
    node.internal.mediaType !== `text/jsx`
  ) {
    return
  }

  const code = await loadNodeContent(node)
  const options = {
    sourceType: `module`,
    allowImportExportEverywhere: true,
    plugins: [
      `jsx`,
      `doExpressions`,
      `objectRestSpread`,
      `decorators`,
      `classProperties`,
      `exportExtensions`,
      `asyncGenerators`,
      `functionBind`,
      `functionSent`,
      `dynamicImport`,
      `flow`,
    ],
  }

  let exportsData, frontmatter, error
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

    frontmatter = {}
    error = false
    traverse(ast, {
      AssignmentExpression: function AssignmentExpression(astPath) {
        if (
          astPath.node.left.type === `MemberExpression` &&
          astPath.node.left.property.name === `frontmatter`
        ) {
          astPath.node.right.properties.forEach(node => {
            frontmatter[node.key.name] = parseData(node.value)
          })
        }
      },
      ExportNamedDeclaration: function ExportNamedDeclaration(astPath) {
        const { declaration } = astPath.node
        if (declaration && declaration.type === `VariableDeclaration`) {
          const dataVariableDeclarator = _.find(
            declaration.declarations,
            d => d.id.name === `frontmatter`
          )

          if (dataVariableDeclarator && dataVariableDeclarator.init) {
            dataVariableDeclarator.init.properties.forEach(node => {
              frontmatter[node.key.name] = parseData(node.value)
            })
          }
        }
      },
    })
  } catch (e) {
    // stick the error on the query so the user can
    // react to an error as they see fit
    error = {
      err: true,
      code: e.code,
      message: e.message,
      stack: e.stack,
    }
  } finally {
    // only create node if frontmatter is not empty
    if (!_.isEmpty(frontmatter)) {
      exportsData = {
        ...frontmatter,
        error: error,
      }

      const objStr = JSON.stringify(node)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(objStr)
        .digest(`hex`)

      const nodeData = {
        id: `${node.id} >>> JavascriptFrontmatter`,
        children: [],
        parent: node.id,
        node: { ...node },
        internal: {
          contentDigest,
          type: `JavascriptFrontmatter`,
        },
      }

      nodeData.frontmatter = { ...exportsData }

      if (node.internal.type === `File`) {
        nodeData.fileAbsolutePath = node.absolutePath
      }

      createNode(nodeData)
      createParentChildLink({ parent: node, child: nodeData })
    }
  }
}

exports.onCreateNode = onCreateNode
