import type { IGatsbySlice } from "../redux/types"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"

export function getSliceId(slice: IGatsbySlice): string {
  return `${slice.componentChunkName}-${createContentDigest(slice.context)}`
}
