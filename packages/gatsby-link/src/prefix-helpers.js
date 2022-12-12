import { isLocalLink } from "./is-local-link"

export const getGlobalBasePrefix = () =>
  process.env.NODE_ENV !== `production`
    ? typeof __BASE_PATH__ !== `undefined`
      ? __BASE_PATH__
      : undefined
    : __BASE_PATH__

// These global values are wrapped in typeof clauses to ensure the values exist.
// This is especially problematic in unit testing of this component.
export const getGlobalPathPrefix = () =>
  process.env.NODE_ENV !== `production`
    ? typeof __PATH_PREFIX__ !== `undefined`
      ? __PATH_PREFIX__
      : undefined
    : __PATH_PREFIX__

export function withPrefix(path, prefix = getGlobalBasePrefix()) {
  if (!isLocalLink(path)) {
    return path
  }

  if (path.startsWith(`./`) || path.startsWith(`../`)) {
    return path
  }
  const base = prefix ?? getGlobalPathPrefix() ?? `/`

  return `${base?.endsWith(`/`) ? base.slice(0, -1) : base}${
    path.startsWith(`/`) ? path : `/${path}`
  }`
}
