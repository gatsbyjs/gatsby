import path from "path"
import { joinPath } from "gatsby-core-utils"

export const withBasePath = (basePath: string) => (
  ...paths: string[]
): string => joinPath(basePath, ...paths)

export const withTrailingSlash = (basePath: string): string => `${basePath}/`

const posixJoinWithLeadingSlash = (paths: string[]): string =>
  path.posix.join(
    ...paths.map((segment, index) =>
      segment === `` && index === 0 ? `/` : segment
    )
  )

export const getCommonDir = (path1: string, path2: string): string => {
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
