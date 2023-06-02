import type { Header } from "../../redux/types"

/**
 * Takes in the Headers array and splits it into two buckets:
 * - dynamicHeaders: Headers with dynamic paths (e.g. /* or /:tests) 
 * - staticHeaders: Headers with fully static paths (e.g. /static/)
 */
export const splitInDynamicAndStaticBuckets = (headers: Array<Header>) => {
  const dynamicHeaders: Array<Header> = []
  const staticHeaders: Array<Header> = []

  for (const header of headers) {
    if (header.source.includes(`:`) || header.source.includes(`*`)) {
      dynamicHeaders.push(header)
    } else {
      staticHeaders.push(header)
    }
  }

  return {
    dynamicHeaders,
    staticHeaders,
  }
}