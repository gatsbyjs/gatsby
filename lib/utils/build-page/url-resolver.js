import { posix as path } from 'path'
import { startsWith } from 'lodash'
import invariant from 'invariant'

let rewritePath
try {
  const gatsbyNodeConfig = path.resolve(process.cwd(), './gatsby-node.js')
  const nodeConfig = require(gatsbyNodeConfig)
  rewritePath = nodeConfig.rewritePath
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    console.log(e)
  }
}

export default function pathResolver (pageData, parsedPath) {
  /**
   * Determines if a hardcoded path was given in the frontmatter of a page.
   */
  function hardcodedPath () {
    if (pageData.path) {
      const pathInvariantMessage = `
      Paths must be prepended with a forward slash. You set the path to
      "${pageData.path}" in "${parsedPath.path}" but instead it should be "/${pageData.path}"

      See http://bit.ly/1qeNpdy for more.
      `
      invariant((pageData.path.charAt(0) === '/'), pathInvariantMessage)
    }

    return pageData.path
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
