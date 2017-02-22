/* @flow weak */
import { posix as path } from 'path'
import includes from 'lodash/includes'
import startsWith from 'lodash/startsWith'
import endsWith from 'lodash/endsWith'
import isUndefined from 'lodash/isUndefined'

let rewritePath
try {
  const gatsbyNodeConfig = path.resolve(process.cwd(), './gatsby-node')
  // $FlowIssue - https://github.com/facebook/flow/issues/1975
  const nodeConfig = require(gatsbyNodeConfig)
  rewritePath = nodeConfig.rewritePath
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' && !includes(e.Error, 'gatsby-node')) {
    console.log(e)
  }
}

export default function pathResolver (pageData, parsedPath) {
  /**
   * Determines if a hardcoded path was given in the frontmatter of a page.
   * Then enforces a starting and trailing slash where applicable on the url.
   */
  function hardcodedPath () {
    if (isUndefined(pageData.path)) return undefined

    let pagePath = pageData.path

    // Enforce a starting slash on all paths
    const pathStartsWithSlash = startsWith(pagePath, '/')
    if (!pathStartsWithSlash) {
      pagePath = `/${pagePath}`
    }

    // Enforce a trailing slash on all paths
    const pathHasExtension = path.extname(pagePath) !== ''
    const pathEndsWithSlash = endsWith(pagePath, '/')
    if (!pathEndsWithSlash && !pathHasExtension) {
      pagePath = `${pagePath}/`
    }

    return pagePath
  }

  /**
   * Determines if the path should be rewritten using rules provided by the
   * user in the gatsby-node.js config file in the root of the project.
   */
  function rewrittenPath () {
    if (rewritePath) {
      return rewritePath(parsedPath, pageData)
    } else { return undefined }
  }

  /**
   * Determines the path of the page using the default of its location on the
   * filesystem.
   */
  function defaultPath () {
    const { dirname } = parsedPath
    let { name } = parsedPath
    if (name === 'template' || name === 'index') {
      name = ''
    }
    return path.join('/', dirname, name, '/')
  }

  /**
   * Returns a path for a page. If the page name starts with an underscore,
   * undefined is returned as it does not become a page.
   */
  if (!startsWith(parsedPath.name, '_')) {
    return hardcodedPath() || rewrittenPath() || defaultPath()
  } else {
    return undefined
  }
}
