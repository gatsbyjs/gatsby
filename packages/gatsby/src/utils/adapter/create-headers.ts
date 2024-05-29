import { match } from "@gatsbyjs/reach-router"
import type { IHeader } from "../../redux/types"
import { rankRoute } from "../rank-route"

type Headers = IHeader["headers"]
interface IHeaderWithScore extends IHeader {
  score: number
}

// We don't care if the path has a trailing slash or not, but to be able to compare stuff we need to normalize it
const normalizePath = (input: string): string =>
  input.endsWith(`/`) ? input : `${input}/`

export const createHeadersMatcher = (
  headers: Array<IHeader> | undefined,
  pathPrefix: string
): ((path: string, defaultHeaders: Headers) => Headers) => {
  function stripPathPrefix(path: string): string {
    if (pathPrefix && path.startsWith(pathPrefix)) {
      path = path.slice(pathPrefix.length)
    }

    return path
  }

  // Split the incoming user headers into two buckets:
  // - dynamicHeaders: Headers with dynamic paths (e.g. /* or /:tests)
  // - staticHeaders: Headers with fully static paths (e.g. /static/)
  // Also add a score using the rankRoute function to each header
  let dynamicHeaders: Array<IHeaderWithScore> = []
  const staticHeaders: Map<string, IHeader> = new Map()

  // If no custom headers are defined by the user in the gatsby-config, we can return only the default headers
  if (!headers || headers.length === 0) {
    return (_path: string, defaultHeaders: Headers) => defaultHeaders
  }

  for (const header of headers) {
    const source = stripPathPrefix(header.source)
    if (source.includes(`:`) || source.includes(`*`)) {
      // rankRoute is the internal function that also "match" uses
      const score = rankRoute(source)

      dynamicHeaders.push({
        ...header,
        score,
        source,
      })
    } else {
      staticHeaders.set(normalizePath(source), {
        ...header,
        source,
      })
    }
  }

  // Sort the dynamic headers by score, moving the ones with the highest specificity to the end of the array
  // If the score is the same, do a lexigraphic comparison of the source
  dynamicHeaders = dynamicHeaders.sort((a, b) => {
    const order = a.score - b.score
    if (order !== 0) {
      return order
    }
    return a.source.localeCompare(b.source)
  })

  return (path: string, defaultHeaders: Headers): Headers => {
    path = stripPathPrefix(path)

    // Create a map of headers for the given path
    // The key will be the header key. Since a key may only appear once in a map, the last header with the same key will win
    const uniqueHeaders: Map<string, string> = new Map()

    // 1. Add default headers
    for (const h of defaultHeaders) {
      uniqueHeaders.set(h.key, h.value)
    }

    // 2. Add dynamic headers that match the current path
    for (const d of dynamicHeaders) {
      if (match(d.source, path)) {
        for (const h of d.headers) {
          uniqueHeaders.set(h.key, h.value)
        }
      }
    }

    const staticEntry = staticHeaders.get(normalizePath(path))

    // 3. Add static headers that match the current path
    if (staticEntry) {
      for (const h of staticEntry.headers) {
        uniqueHeaders.set(h.key, h.value)
      }
    }

    // Convert the map back to an array of objects
    return Array.from(uniqueHeaders.entries()).map(([key, value]) => {
      return {
        key,
        value,
      }
    })
  }
}
