// TODO add tests especially for handling prefixed links.
import { matchPath } from "react-router-dom"

const pageCache = {}

module.exports = (pages, pathPrefix = ``) => pathname => {
  // Remove the pathPrefix from the pathname.
  let trimmedPathname = pathname.slice(pathPrefix.length)

  // Remove any hashfragment
  if (trimmedPathname.split(`#`).length > 1) {
    trimmedPathname = trimmedPathname.split(`#`).slice(0, -1).join(``)
  }

  if (pageCache[trimmedPathname]) {
    return pageCache[trimmedPathname]
  }

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
        pageCache[trimmedPathname] = page
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
        pageCache[trimmedPathname] = page
        return true
      }
    }

    return false
  })

  return foundPage
}
