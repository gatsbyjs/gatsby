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
  if ((ignore as IPathIgnoreOptions).options !== undefined) {
    settings.options = (ignore as IPathIgnoreOptions).options || {}
  }
  if ((ignore as IPathIgnoreOptions).patterns) {
    settings.patterns = (ignore as IPathIgnoreOptions).patterns
  } else {
    // Allow shorthand ignore patterns ['pattern'] or 'pattern'
    if (Array.isArray(ignore) && ignore.length > 0) {
      settings.patterns = ignore
    } else if (typeof ignore === `string`) {
      settings.patterns = ignore
    } else {
      return false
    }
  }
  // Return true if the path should be ignored (matches any given ignore patterns)
  return mm.any(path, settings.patterns as string | string[], settings.options)
}
