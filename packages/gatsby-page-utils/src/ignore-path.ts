import * as mm from "micromatch"

interface IPathIgnoreOptions {
  patterns: string | ReadonlyArray<string>
  options?: mm.Options
}

export function ignorePath(
  path: string,
  ignore?: IPathIgnoreOptions | string | string[] | {} | null
): boolean {
  // Don't do anything if no ignore patterns
  if (!ignore) return false
  const settings: {
    patterns: string | ReadonlyArray<string>
    options: mm.Options
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
    // TS should be able to assert that `ignore` must be a `IPathIgnoreOptions` now
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
  // Return true if the path should be ignored (matches any given ignore patterns)
  return mm.any(path, settings.patterns as string | string[], settings.options)
}
