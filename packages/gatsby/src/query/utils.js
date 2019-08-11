/**
 * @param {string} string
 * @returns {string}
 */
const indentString = (string) => string.replace(/\n/g, `\n  `)

/**
 * @param {Map<string, any>} errorDetails
 * @returns {string}
 */
const formatErrorDetails = errorDetails =>
  Array.from(errorDetails.entries())
    .map(
      ([name, details]) => `${name}:
  ${indentString(details.toString())}`
    )
    .join(`\n`)

export { indentString, formatErrorDetails }
