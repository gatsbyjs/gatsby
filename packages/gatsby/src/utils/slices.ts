import type { IGatsbySlice } from "../redux/types"
import { createContentDigest } from "gatsby-core-utils"

export function getSliceId(slice: IGatsbySlice): string {
  return `${slice.componentChunkName}-${createContentDigest(slice.context)}`
}
