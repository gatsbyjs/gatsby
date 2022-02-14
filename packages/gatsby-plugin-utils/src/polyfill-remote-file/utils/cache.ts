import { getCache as getGatsbyCache } from "gatsby/dist/utils/get-cache"
import type { GatsbyCache } from "gatsby"

export function getCache(): GatsbyCache {
  return getGatsbyCache(`gatsby`)
}
