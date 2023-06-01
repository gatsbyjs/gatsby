import _ from "lodash"
import type { Header } from "../../redux/types"

export const splitInStaticAndDynamicBuckets = (headers: Array<Header>) => {
  const isDynamic = (header: Header) => header.source.includes(`:`) || header.source.includes(`*`)

  const [dynamicHeaders, staticHeaders] = _.partition(headers, isDynamic)

  return {
    dynamicHeaders,
    staticHeaders,
  }
}