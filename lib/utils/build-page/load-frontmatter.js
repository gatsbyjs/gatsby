/* @flow */
import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'
import objectAssign from 'object-assign'
import htmlFrontMatter from 'html-frontmatter'
import * as babylon from 'babylon'
import traverse from 'babel-traverse'

export default function loadFrontmatter (pagePath: string): {} {
  const ext: string = path.extname(pagePath).slice(1)

  // Load data for each file type.
  // TODO use webpack-require to ensure data loaded
  // here (in node context) is consistent with what's loaded
  // in the browser.

  let data
  if (ext.match(/^(md|rmd|mkdn?|mdwn|mdown|markdown|litcoffee)$/)) {
    const rawData = frontMatter(fs.readFileSync(pagePath, { encoding: 'utf-8' }))
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

      data = {}
      traverse(ast, {
        AssignmentExpression (astPath) {
          if (astPath.node.left.type === 'MemberExpression' &&
            astPath.node.left.property.name === 'data') {
            astPath.node.right.properties.forEach((prop) => {
              // Experimental basic support for template literals:
              // Extract and join any text content; ignore interpolations
              if (prop.value.type === 'TemplateLiteral') {
                data[prop.key.name] = prop.value.quasis
                  .map(quasi => quasi.value.cooked)
                  .join('')
              } else {
                data[prop.key.name] = prop.value.value
              }
            })
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
