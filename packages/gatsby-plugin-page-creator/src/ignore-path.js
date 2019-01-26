const mm = require(`micromatch`)

module.exports = (path, ignore) => {
  // Don't do anything if no ignore patterns
  if (!ignore || !ignore.patterns) return false
  // Return true if the path should be ignored (matches any given ignore patterns)
  return mm.any(path, ignore.patterns, ignore.options)
}
