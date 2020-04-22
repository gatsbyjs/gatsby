const mm = require(`micromatch`)

module.exports = (path, ignore) => {
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
    } else if (typeof ignore != `object`) {
      settings.patterns = ignore.toString()
    } else {
      return false
    }
  }
  // Return true if the path should be ignored (matches any given ignore patterns)
  return mm.any(path, settings.patterns, settings.options)
}
