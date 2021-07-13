import { isMatch, Options as mmOptions } from "micromatch"

export interface IPathIgnoreOptions {
  patterns?: string | ReadonlyArray<string>
  options?: mmOptions
  overrideDefaults?: boolean
}

export function ignorePath(
  path: string,
  ignore?: IPathIgnoreOptions | string | Array<string> | null
): boolean {
  // Don't do anything if no ignore patterns
  if (!ignore) return false
  const settings: {
    patterns: string | ReadonlyArray<string>
    options: mmOptions
  } = {
    patterns: ``,
    options: {},
  }
  if (typeof ignore === `string`) {
    settings.patterns = ignore
  } else if (Array.isArray(ignore)) {
    if (ignore.length > 0) {
      settings.patterns = ignore
    }
  } else if (ignore === null) {
    return false
  } else {
    if (!ignore.options && !ignore.patterns) {
      return false
    }
    if (ignore.options) {
      settings.options = ignore.options
    }
    if (ignore.patterns) {
      settings.patterns = ignore.patterns
    }
  }
  return isMatch(path, settings.patterns, settings.options)
}
