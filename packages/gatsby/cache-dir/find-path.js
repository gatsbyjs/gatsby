import { match } from "@reach/router/lib/utils"
import stripPrefix from "./strip-prefix"
import normalizePagePath from "./normalize-page-path"

const trimPathname = rawPathname => {
  let pathname = decodeURIComponent(rawPathname)
  // Remove the pathPrefix from the pathname.
  let trimmedPathname = stripPrefix(pathname, __BASE_PATH__)
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
  return trimmedPathname
}

class PathFinder {
  constructor(matchPaths) {
    this.matchPaths = matchPaths
    this.pathCache = new Map()
  }

  findMatchPath(trimmedPathname) {
    for (const { matchPath, path } of this.matchPaths) {
      if (match(matchPath, trimmedPathname)) {
        return path
      }
    }
    return null
  }

  // Given a raw URL path, returns the cleaned version of it (trim off
  // `#` and query params), or if it matches an entry in
  // `match-paths.json`, its matched path is returned
  //
  // E.g `/foo?bar=far` => `/foo`
  //
  // Or if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
  // `/foo?bar=far` => `/page1`
  find(rawPathname) {
    let trimmedPathname = trimPathname(rawPathname)

    if (this.pathCache.has(trimmedPathname)) {
      return this.pathCache.get(trimmedPathname)
    }

    let foundPath = this.findMatchPath(trimmedPathname)
    if (!foundPath) {
      if (trimmedPathname === `/index.html`) {
        foundPath = `/`
      } else {
        foundPath = trimmedPathname
      }
    }
    foundPath = normalizePagePath(foundPath)
    this.pathCache.set(trimmedPathname, foundPath)
    return foundPath
  }
}

export default PathFinder
