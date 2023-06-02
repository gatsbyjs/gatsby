import type { IHeader } from "../../redux/types"

/**
 * Takes in the Headers array and splits it into two buckets:
 * - dynamicHeaders: Headers with dynamic paths (e.g. /* or /:tests)
 * - staticHeaders: Headers with fully static paths (e.g. /static/)
 */
export const splitInDynamicAndStaticBuckets = (
  headers: Array<IHeader>
): { dynamicHeaders: Array<IHeader>; staticHeaders: Array<IHeader> } => {
  const dynamicHeaders: Array<IHeader> = []
  const staticHeaders: Array<IHeader> = []

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
