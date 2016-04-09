import fs from 'fs'
import path from 'path'
import frontMatter from 'front-matter'
import objectAssign from 'object-assign'
import htmlFrontMatter from 'html-frontmatter'

export default function loadFrontmatter (pagePath) {
  const ext = path.extname(pagePath).slice(1)

  // Load data for each file type.
  // TODO use webpack-require to ensure data loaded
  // here (in node context) is consistent with what's loaded
  // in the browser.

  let data
  if (ext === 'md') {
    const rawData = frontMatter(fs.readFileSync(pagePath, 'utf-8'))
    data = objectAssign({}, rawData.attributes)
  } else if (ext === 'html') {
    const html = fs.readFileSync(pagePath, 'utf-8')
    data = objectAssign({}, htmlFrontMatter(html), { body: html })
  } else {
    data = {}
  }

  return data
}
