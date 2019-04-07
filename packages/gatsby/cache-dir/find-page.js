// TODO add tests especially for handling prefixed links.
import { match as matchPath } from "@reach/router/lib/utils"
import stripPrefix from "./strip-prefix"

const pageCache = {}

export default (pages, pathPrefix = ``) => rawPathname => {
  let pathname = decodeURIComponent(rawPathname)

  // Remove the pathPrefix from the pathname.
  let trimmedPathname = stripPrefix(pathname, pathPrefix)

  // Remove any hashfragment
  if (trimmedPathname.split(`#`).length > 1) {
    trimmedPathname = trimmedPathname
      .split(`#`)
      .slice(0, -1)
      .join(``)
  }

  // Remove search query
  if (trimmedPathname.split(`?`).length > 1) {
    trimmedPathname = trimmedPathname
      .split(`?`)
      .slice(0, -1)
      .join(``)
  }

  if (pageCache[trimmedPathname]) {
    return pageCache[trimmedPathname]
  }

  let foundPage
  // Array.prototype.find is not supported in IE so we use this somewhat odd
  // work around.
  pages.some(page => {
    let pathToMatch = page.matchPath ? page.matchPath : page.path
    if (matchPath(pathToMatch, trimmedPathname)) {
      foundPage = page
      pageCache[trimmedPathname] = page
      return true
    }

    // Finally, try and match request with default document.
    if (matchPath(`${page.path}index.html`, trimmedPathname)) {
      foundPage = page
      pageCache[trimmedPathname] = page
      return true
    }

    return false
  })

  return foundPage
}
