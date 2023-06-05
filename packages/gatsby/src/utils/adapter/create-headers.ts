import { match } from "@gatsbyjs/reach-router"
import type { IHeader } from "../../redux/types"
import { store } from "../../redux"

type Headers = IHeader["headers"]

export const createHeadersMatcher = (): ((
  path: string,
  defaultHeaders: Headers
) => Headers) => {
  const { headers } = store.getState().config

  // Split the incoming user headers into two buckets:
  // - dynamicHeaders: Headers with dynamic paths (e.g. /* or /:tests)
  // - staticHeaders: Headers with fully static paths (e.g. /static/)
  // Also add a score using the rankRoute function to each header
  const dynamicHeaders: Array<IHeader> = []
  const staticHeaders: Array<IHeader> = []

  // If no custom headers are defined by the user in the gatsby-config, we can return only the default headers
  if (!headers) {
    return (_path: string, defaultHeaders: Headers) => defaultHeaders
  }

  for (const header of headers) {
    if (header.source.includes(`:`) || header.source.includes(`*`)) {
      dynamicHeaders.push(header)
    } else {
      staticHeaders.push(header)
    }
  }

  return (path: string, defaultHeaders: Headers): Headers => {
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

    const staticEntry = staticHeaders.find(s => s.source === path)

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
