// @flow

const PrettyError = require(`pretty-error`)
const prepareStackTrace = require(`./prepare-stack-trace`)
const _ = require(`lodash`)
const { isNodeInternalModulePath } = require(`gatsby-core-utils`)

const packagesToSkip = [`core-js`, `bluebird`, `regenerator-runtime`, `graphql`]

const packagesToSkipTest = new RegExp(
  `node_modules[\\/](${packagesToSkip.join(`|`)})`
)

// TO-DO: move this this out of this file (and probably delete this file completely)
// it's here because it re-implements similar thing as `pretty-error` already does
const sanitizeStructuredStackTrace = stack => {
  // first filter out not useful call sites
  stack = stack.filter(callSite => {
    if (!callSite.fileName) {
      return false
    }

    if (packagesToSkipTest.test(callSite.fileName)) {
      return false
    }

    if (callSite.fileName.includes(`asyncToGenerator.js`)) {
      return false
    }

    if (isNodeInternalModulePath(callSite.fileName)) {
      return false
    }

    return true
  })

  // then sanitize individual call site objects to make sure we don't
  // emit objects with extra fields that won't be handled by consumers
  stack = stack.map(callSite =>
    _.pick(callSite, [`fileName`, `functionName`, `columnNumber`, `lineNumber`])
  )

  return stack
}

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
    "pretty-error > header": {
      background: `red`,
    },
    "pretty-error > header > colon": {
      color: `white`,
    },
  })

  if (process.env.FORCE_COLOR === `0`) {
    prettyError.withoutColors()
  }

  prettyError.render = err => {
    if (Array.isArray(err)) {
      return err.map(prettyError.render).join(`\n`)
    }

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
 * @param {string} sourceMapFile
 */
async function createErrorFromString(
  errorStr: string = ``,
  sourceMapFile: string
) {
  let [message, ...rest] = errorStr.split(/\r\n|[\n\r]/g)
  // pull the message from the first line then remove the `Error:` prefix
  // FIXME: when https://github.com/AriaMinaei/pretty-error/pull/49 is merged

  message = message.replace(/^(Error:)/, ``)

  let error = new Error(message)

  error.stack = [message, rest.join(`\n`)].join(`\n`)

  error.name = `WebpackError`
  try {
    if (sourceMapFile) await prepareStackTrace(error, sourceMapFile)
  } catch (err) {
    // don't shadow a real error because of a parsing issue
  }
  return error
}

module.exports = {
  createErrorFromString,
  getErrorFormatter,
  sanitizeStructuredStackTrace,
}
