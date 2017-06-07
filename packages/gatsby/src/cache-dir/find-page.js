// TODO add tests especially for handling prefixed links.
import { matchPath } from "react-router-dom"

module.exports = pages => pathname => {
  let foundPage
  // Array.prototype.find is not supported in IE so we use this somewhat odd
  // work around.
  pages.some(page => {
    if (page.matchPath) {
      // Try both the path and matchPath
      if (
        matchPath(pathname, { path: page.path }) ||
        matchPath(pathname, {
          path: page.matchPath,
        })
      ) {
        foundPage = page
        return true
      }
    } else {
      if (
        matchPath(pathname, {
          path: page.path,
          exact: true,
        })
      ) {
        foundPage = page
        return true
      }
    }

    return false
  })

  return foundPage
}
