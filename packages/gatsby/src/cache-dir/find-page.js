// TODO add tests especially for handling prefixed links.
import { matchPath } from "react-router-dom"

module.exports = (pages, linkPrefix = ``) => pathname => {
  // Remove the linkPrefix from the pathname.
  const trimmedPathname = pathname.slice(linkPrefix.length)
  let foundPage
  // Array.prototype.find is not supported in IE so we use this somewhat odd
  // work around.
  pages.some(page => {
    if (page.matchPath) {
      // Try both the path and matchPath
      if (
        matchPath(trimmedPathname, { path: page.path }) ||
        matchPath(trimmedPathname, {
          path: page.matchPath,
        })
      ) {
        foundPage = page
        return true
      }
    } else {
      if (
        matchPath(trimmedPathname, {
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
