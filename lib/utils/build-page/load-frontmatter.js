/* @flow */
import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'
import objectAssign from 'object-assign'
import _ from 'lodash'
import htmlFrontMatter from 'html-frontmatter'
import * as babylon from 'babylon'
import traverse from 'babel-traverse'

export default function loadFrontmatter(pagePath: string): {} {
  const ext: string = path.extname(pagePath).slice(1)

  // Load data for each file type.
  // TODO use webpack-require to ensure data loaded
  // here (in node context) is consistent with what's loaded
  // in the browser.

  let data
  if (ext.match(/^(md|rmd|mkdn?|mdwn|mdown|markdown|litcoffee)$/)) {
    const rawData = frontMatter(
      fs.readFileSync(pagePath, { encoding: 'utf-8' })
    )
    data = objectAssign({}, rawData.attributes)
  } else if (ext === 'html') {
    const html = fs.readFileSync(pagePath, { encoding: 'utf-8' })
    // $FlowIssue - https://github.com/facebook/flow/issues/1870
    data = objectAssign({}, htmlFrontMatter(html), { body: html })
  } else if (ext === 'js' || ext === 'jsx') {
    try {
      const code = fs.readFileSync(pagePath, { encoding: 'utf-8' })
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
      data = {}
    }
  } else {
    data = {}
  }

  return data
}
