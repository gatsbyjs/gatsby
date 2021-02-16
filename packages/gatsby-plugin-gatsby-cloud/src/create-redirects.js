import { writeFile } from "fs-extra"
import { REDIRECTS_FILENAME } from "./constants"

/**
 * Get all rewrites and sort them by most specific at the top
 * code is based on @reach/router match utility (https://github.com/reach/router/blob/152aff2352bc62cefc932e1b536de9efde6b64a5/src/lib/utils.js#L224-L254)
 */

const paramRe = /^:(.+)/

const SEGMENT_POINTS = 4
const STATIC_POINTS = 3
const DYNAMIC_POINTS = 2
const SPLAT_PENALTY = 1
const ROOT_POINTS = 1

const isRootSegment = segment => segment === ``
const isDynamic = segment => paramRe.test(segment)
const isSplat = segment => segment === `*`

const rankRoute = (route, index) => {
  const score = route.default
    ? 0
    : segmentize(route).reduce((score, segment) => {
        score += SEGMENT_POINTS
        if (isRootSegment(segment)) score += ROOT_POINTS
        else if (isDynamic(segment)) score += DYNAMIC_POINTS
        else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY
        else score += STATIC_POINTS
        return score
      }, 0)
  return { route, score, index }
}

const rankRoutes = routes =>
  routes
    .map(rankRoute)
    .sort((a, b) =>
      a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
    )

const segmentize = uri =>
  uri
    // strip starting/ending slashes
    .replace(/(^\/+|\/+$)/g, ``)
    .split(`/`)

/**
 * rankRewrites
 *
 * We need to order rewrites in order of specificity because more specific rewrites have to be first in order.
 * i.e. /url_that_is/ugly is more specific than /path4/:param1 even though both have 2 url segments
 */
const rankRewrites = rewrites => {
  let sortedRewrites = []

  const fromPaths = rewrites.map(({ fromPath }) => fromPath)
  const rankedRoutes = rankRoutes(fromPaths)

  for (let { route } of rankedRoutes) {
    const rewrite = rewrites.find(rewrite => rewrite.fromPath === route)
    if (rewrite) {
      sortedRewrites.push(rewrite)
    }
  }

  return sortedRewrites
}

export default async function writeRedirectsFile(
  pluginData,
  redirects,
  rewrites,
  siblingStaticPaths
) {
  const { publicFolder } = pluginData

  if (!redirects.length && !rewrites.length) return null

  // order rewrites based on priority
  const rankedRewrites = rankRewrites(rewrites)

  // Is it ok to pass through the data or should we format it so that we don't have dependencies
  // between the redirects and rewrites formats? What are the chances those will change?
  const FILE_PATH = publicFolder(REDIRECTS_FILENAME)
  return writeFile(
    FILE_PATH,
    JSON.stringify({ redirects, rewrites: rankedRewrites, siblingStaticPaths })
  )
}
