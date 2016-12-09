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
  if (ext === 'md') {
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
        plugins: ['*'] // may only need ['jsx', 'objectRestSpread']?
      }
      const ast = babylon.parse(code, options);

      data = {}
      traverse(ast, {
        AssignmentExpression(path) {
          if (path.node.left.type === 'MemberExpression' &&
            path.node.left.property.name === 'data') {
              path.node.right.properties.forEach((prop) => {
                data[prop.key.name] = prop.value.value
              })
          }
        }
      })
    } catch (e) {
      console.log('Failed to parse file')
      console.log(e)
      data = {}
    }
  } else {
    data = {}
  }

  return data
}
