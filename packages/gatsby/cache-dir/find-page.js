// TODO add tests especially for handling prefixed links.
import stripPrefix from "./strip-prefix"
import { matchPathFactory } from "./path-matcher"

const pageCache = {}

export default (pages, pathPrefix = ``) => {
  const matchRoute = matchPathFactory(pages)

  return rawPathname => {
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

    const foundPage = matchRoute(trimmedPathname)
    if (foundPage) {
      pageCache[trimmedPathname] = foundPage
    }

    return foundPage
  }
}
