import { isEqual, startsWith } from "lodash"

export const isDynamicSegment = segment =>
  startsWith(segment, `:`) || startsWith(segment, `*`)

export const isSibling = (pagePath, maybeSiblingPagePath) => {
  const pageSegments = pagePath.split(`/`).filter(Boolean)
  const maybeSiblingPageSegments = maybeSiblingPagePath
    .split(`/`)
    .filter(Boolean)

  // Do we have the same number of segments?
  if (pageSegments.length !== maybeSiblingPageSegments.length) {
    return false
  }

  // Are all the segments except the last one the same?
  if (
    !isEqual(
      pageSegments.slice(0, pageSegments.length - 1),
      maybeSiblingPageSegments.slice(0, pageSegments.length - 1)
    )
  ) {
    return false
  }

  const finalSegmentForPage = pageSegments[pageSegments.length - 1]
  const finalSegmentForMaybeSiblingPage =
    maybeSiblingPageSegments[maybeSiblingPageSegments.length - 1]

  // Is the final segment the same?
  if (finalSegmentForPage === maybeSiblingPageSegments) {
    return false
  }

  // Is one of the segments a dynamic one?
  if (
    !isDynamicSegment(finalSegmentForPage) &&
    !isDynamicSegment(finalSegmentForMaybeSiblingPage)
  ) {
    return false
  }

  return true
}
