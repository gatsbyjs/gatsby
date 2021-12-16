import { resolve } from "@gatsbyjs/reach-router/lib/utils"
// Specific import to treeshake Node.js stuff
import { applyTrailingSlashOption } from "gatsby-page-utils/apply-trailing-slash-option"
import { parsePath } from "./parse-path"
import { isLocalLink } from "./is-local-link"
import { withPrefix } from "."

const isAbsolutePath = path => path?.startsWith(`/`)

const getGlobalTrailingSlash = () =>
  process.env.NODE_ENV !== `production`
    ? typeof __TRAILING_SLASH__ !== `undefined`
      ? __TRAILING_SLASH__
      : undefined
    : __TRAILING_SLASH__

function absolutify(path, current) {
  // If it's already absolute, return as-is
  if (isAbsolutePath(path)) {
    return path
  }
  return resolve(path, current)
}

export const rewriteLinkPath = (path, relativeTo) => {
  const { pathname, search, hash } = parsePath(path)
  const option = getGlobalTrailingSlash()
  let adjustedPath = path

  if (typeof path === `number`) {
    return path
  }
  if (!isLocalLink(path)) {
    return path
  }

  if (option === `always` || option === `never`) {
    const output = applyTrailingSlashOption(pathname, option)
    adjustedPath = `${output}${search}${hash}`
  }

  return isAbsolutePath(adjustedPath)
    ? withPrefix(adjustedPath)
    : absolutify(adjustedPath, relativeTo)
}
