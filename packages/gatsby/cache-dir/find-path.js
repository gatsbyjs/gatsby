import { match } from "@reach/router/lib/utils"
import stripPrefix from "./strip-prefix"
import normalizePagePath from "./normalize-page-path"

const pathCache = new Map()
let matchPaths = []

const trimPathname = rawPathname => {
  let pathname = decodeURIComponent(rawPathname)
  // Remove the pathPrefix from the pathname.
  let trimmedPathname = stripPrefix(pathname, __BASE_PATH__)
    // Remove any hashfragment
    .split(`#`)[0]
    // Remove search query
    .split(`?`)[0]

  return trimmedPathname
}

/**
 * Set list of matchPaths
 *
 * @param {Array<{path: string, matchPath: string}>} value collection of matchPaths
 */
export const setMatchPaths = value => {
  matchPaths = value
}

/**
 * Return a matchpath url
 * if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
 * `/foo?bar=far` => `/page1`
 *
 * @param {string} rawPathname A raw pathname
 * @return {string|null}
 */
export const findMatchPath = rawPathname => {
  const trimmedPathname = cleanPath(rawPathname)

  for (const { matchPath, path } of matchPaths) {
    if (match(matchPath, trimmedPathname)) {
      return normalizePagePath(path)
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
export const findPath = rawPathname => {
  const trimmedPathname = trimPathname(rawPathname)

  if (pathCache.has(trimmedPathname)) {
    return pathCache.get(trimmedPathname)
  }

  let foundPath = findMatchPath(trimmedPathname)

  if (!foundPath) {
    foundPath = cleanPath(rawPathname)
  }

  pathCache.set(trimmedPathname, foundPath)

  return foundPath
}

/**
 * Clean a url and converts /index.html => /
 * E.g `/foo?bar=far` => `/foo`
 *
 * @param {string} rawPathname A raw pathname
 * @return {string}
 */
export const cleanPath = rawPathname => {
  const trimmedPathname = trimPathname(rawPathname)

  let foundPath = trimmedPathname
  if (foundPath === `/index.html`) {
    foundPath = `/`
  }

  foundPath = normalizePagePath(foundPath)

  return foundPath
}
