/* @flow */
import path from 'path'
import objectAssign from 'object-assign'
import pathResolver from './path-resolver'
import loadFrontmatter from './load-frontmatter'

export default function buildPage (directory: string, page: string) {
  const pageData = loadFrontmatter(page)

  const relativePath: string = path.relative(path.join(directory, `pages`), page)
  const pathData = pathResolver(relativePath, pageData)

  return objectAssign({}, pathData, { data: pageData })
}
