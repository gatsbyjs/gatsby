/**
 * Parse source code containing (just) ES6 import declarations and return the
 * names of all bindings created by such a declaration.
 * The function will assume strict ES6 import code.
 * The input may contain multiple import statements, each starting on a new line
 * First it strips the irrelevant bits (like `import`, curly brackets, and
 * `from` tail. What's left ought to be a string in the form of
 * `id[ as id] [, id[ as id]]`
 * (where the brackets represent optional repeating parts). The left-most id
 * might also contain star (namespaced import). This step also strips
 * `import "foo"` shorthand imports.
 * The second part will trim and split the string on comma, then each segment
 * is split on `as` (in a proper way) and the right-most identifier is returned.
 *
 * For testing purposes you can also request the segments, after split on comma.
 *
 * @param {string} importCode
 * @param {boolean=false} returnSegments
 * @returns {Array<string> | {bindings: Array<string>, segments: Array<string>}}
 */
function parseImportBindings(importCode, returnSegments = false) {
  const str = importCode.replace(
    /^\s*import\s*['"][^'"]*?['"].*?$|^\s*import|[{},]|\s*from\s*['"][^'"]*?['"].*?$/gm,
    ` , `
  )
  const segments = str
    .trim()
    .split(/\s*,\s*/g)
    .filter(s => s !== ``)
  const bindings = segments.map(
    segment =>
      // `s` is either an ident (the binding), or `a as b` where `b` is the
      // binding. We split on `as` (taking spacing edge cases into account)
      // and return the right-most ident that is left, trimmed.
      // If `as` is used, it must be followed by some kind of spacing.
      // Notable edge case: `*as as` is legit, namespace importing to var `as`
      segment.split(/as\s+(?=[\w\d$_]+$)/).pop()
    // Note: since `s` was trimmed, and the split consumed any spacing after
    // the `as`, the result ident must be trimmed.
  )
  if (returnSegments) {
    // For snapshot testing
    return { bindings, segments }
  }
  return bindings
}

module.exports = {
  parseImportBindings,
}
