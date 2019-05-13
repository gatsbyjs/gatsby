// @flow

const indentString = (string: string): string => string.replace(/\n/g, `\n  `)

const formatErrorDetails = (errorDetails: Map<string, any>): string =>
  Array.from(errorDetails.entries())
    .map(
      ([name, details]) => `${name}:
  ${indentString(details.toString())}`
    )
    .join(`\n`)

export { indentString, formatErrorDetails }
