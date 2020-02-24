const path = require(`path`)
const { joinPath, createContentDigest } = require(`gatsby-core-utils`)

export function withBasePath(basePath) {
  return (...paths) => joinPath(basePath, ...paths)
}

export function withTrailingSlash(basePath) {
  return `${basePath}/`
}

const posixJoinWithLeadingSlash = paths =>
  path.posix.join(
    ...paths.map((segment, index) =>
      segment === `` && index === 0 ? `/` : segment
    )
  )

export function getCommonDir(path1, path2) {
  const path1Segments = path1.split(/[/\\]/)
  const path2Segments = path2.split(/[/\\]/)

  for (let i = 0; i < path1Segments.length; i++) {
    if (i >= path2Segments.length) {
      return posixJoinWithLeadingSlash(path2Segments)
    } else if (
      path1Segments[i].toLowerCase() !== path2Segments[i].toLowerCase()
    ) {
      const joined = path1Segments.slice(0, i)
      return posixJoinWithLeadingSlash(joined)
    }
  }

  return posixJoinWithLeadingSlash(path1Segments)
}

const MAX_PATH_SEGMENT_CHARS = 255
const MAX_PATH_SEGMENT_BYTES = 255
const SLICING_INDEX = 100
const SLICING_INDEX_BYTES = 50
const pathSegmentRe = /[^/]+/g

const isMacOs = process.platform === `darwin`
const isWindows = process.platform === `win32`

export const truncatePath = path =>
  path.replace(pathSegmentRe, match => {
    if (isMacOS || isWindows) {
      if (match.length > MAX_PATH_SEGMENT_CHARS) {
        return (
          match.slice(0, SLICING_INDEX) +
          createContentDigest(match.slice(SLICING_INDEX))
        )
      }
    } else {
      if (Buffer.from(match).length > MAX_PATH_SEGMENT_BYTES) {
        return (
          match.slice(0, SLICING_INDEX_BYTES) +
          createContentDigest(match.slice(SLICING_INDEX_BYTES))
        )
      }
    }

    return match
  })
