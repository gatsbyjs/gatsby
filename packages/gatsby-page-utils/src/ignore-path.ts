import * as mm from "micromatch"

interface IIgnoreOptions {
  patterns: string | ReadonlyArray<string>
  options: mm.Options
}

export function ignorePath(path: string, ignore?: IIgnoreOptions): boolean {
  // Don't do anything if no ignore patterns
  if (!ignore) return false
  const settings = {
    patterns: ignore.patterns,
    options: ignore.options,
  }
  // Allow shorthand ignore patterns ['pattern'] or 'pattern'
  if (!ignore.patterns) {
    if (Array.isArray(ignore) && ignore.length > 0) {
      settings.patterns = ignore
    } else if (typeof ignore === `string`) {
      settings.patterns = ignore
    } else {
      return false
    }
  }
  // Return true if the path should be ignored (matches any given ignore patterns)
  return mm.any(path, settings.patterns, settings.options)
}
