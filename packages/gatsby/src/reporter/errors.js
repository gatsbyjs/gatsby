// @flow

const PrettyError = require(`pretty-error`)
const prepareStackTrace = require(`./prepare-stack-trace`)

function getErrorFormatter() {
  const prettyError = new PrettyError()
  const baseRender = prettyError.render

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

  prettyError.render = (err) => {
    let rendered = baseRender.call(prettyError, err)
    if (err && err.codeFrame) rendered = `\n${err.codeFrame}\n${rendered}`
      return rendered
  }
  return prettyError
}

/**
 * Convert a stringified webpack compilation error back into
 * an Error instance so it can be formatted properly
 * @param {string} errorStr
 */
function createErrorFromString(errorStr: string, sourceMapFile: string) {
  let [message, ...rest] = errorStr.split(/\r\n|[\n\r]/g)
  // pull the message from the first line then remove the `Error:` prefix
  // FIXME: when https://github.com/AriaMinaei/pretty-error/pull/49 is merged

  message = message.split(`:`).slice(1).join(`:`)

  let error = new Error(message)

  error.stack = [message, rest.join(`\n`)].join(`\n`)

  error.name = `WebpackError`

  if (sourceMapFile)
    prepareStackTrace(error, sourceMapFile)

  return error
}

module.exports = {
  createErrorFromString,
  getErrorFormatter,
}
