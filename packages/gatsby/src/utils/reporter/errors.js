// @flow

const PrettyError = require(`pretty-error`)

function getErrorFormatter() {
  const prettyError = new PrettyError()

  prettyError.skipNodeFiles()
  prettyError.skipPackage(
    `regenerator-runtime`,
    `graphql`,
    `core-js`
    // `static-site-generator-webpack-plugin`,
    // `tapable`, // webpack
  )

  prettyError.skip((traceLine, ln) => {
    if (traceLine && traceLine.file === `asyncToGenerator.js`) return true
    return false
  })

  prettyError.appendStyle({
    "pretty-error": {
      marginTop: 1,
    },
  })

  return prettyError
}

/**
 * Convert a stringified webpack compilation error back into
 * an Error instance so it can be formatted properly
 * @param {string} errorStr
 */
function createErrorFromString(errorStr: string) {
  let [message, ...rest] = errorStr.split(/\r\n|[\n\r]/g)
  // pull the message from the first line then remove the `Error:` prefix
  // FIXME: when https://github.com/AriaMinaei/pretty-error/pull/49 is merged
  let error = new Error()
  error.stack = [
    message
      .split(`:`)
      .slice(1)
      .join(`:`),
    rest.join(`\n`),
  ].join(`\n`)
  error.name = `WebpackError`
  return error
}

/**
 * Format a html stage compilation error to only show stack lines
 * for 'render-page.js' the output file for those stages, since it contains
 * the relevant details for debugging.
 *
 * @param {Error} error
 */
function formatStaticBuildError(error: Error) {
  // For HTML compilation issues we filter down the error
  // to only the bits that are relevant for debugging
  const formatter = getErrorFormatter()
  formatter.skip(traceLine => !traceLine || traceLine.file !== `render-page.js`)
  return formatter.render(error)
}

module.exports = {
  createErrorFromString,
  getErrorFormatter,
  formatStaticBuildError,
}
