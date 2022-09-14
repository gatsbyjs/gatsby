import { resolve } from "@gatsbyjs/reach-router"
// Specific import to treeshake Node.js stuff
import { applyTrailingSlashOption } from "gatsby-page-utils/apply-trailing-slash-option"
import { parsePath } from "./parse-path"
import { isLocalLink } from "./is-local-link"
import { withPrefix } from "./prefix-helpers"

const isAbsolutePath = path => path?.startsWith(`/`)

const getGlobalTrailingSlash = () =>
  typeof __TRAILING_SLASH__ !== `undefined` ? __TRAILING_SLASH__ : undefined

function absolutify(path, current) {
  // If it's already absolute, return as-is
  if (isAbsolutePath(path)) {
    return path
  }

  const option = getGlobalTrailingSlash()
  const absolutePath = resolve(path, current)

  if (option === `always` || option === `never`) {
    return applyTrailingSlashOption(absolutePath, option)
  }

  return absolutePath
}

function applyPrefix(path) {
  const prefixed = withPrefix(path)
  const option = getGlobalTrailingSlash()

  if (option === `always` || option === `never`) {
    const { pathname, search, hash } = parsePath(prefixed)
    const output = applyTrailingSlashOption(pathname, option)

    return `${output}${search}${hash}`
  }

  return prefixed
}

export const rewriteLinkPath = (path, relativeTo) => {
  if (typeof path === `number`) {
    return path
  }
  if (!isLocalLink(path)) {
    return path
  }

  return isAbsolutePath(path) ? applyPrefix(path) : absolutify(path, relativeTo)
}
