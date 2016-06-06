/* @flow */
import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'
import objectAssign from 'object-assign'
import htmlFrontMatter from 'html-frontmatter'

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
  } else {
    data = {}
  }

  return data
}
