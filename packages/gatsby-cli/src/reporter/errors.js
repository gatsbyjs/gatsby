// @flow

const PrettyError = require(`pretty-error`)
const prepareStackTrace = require(`./prepare-stack-trace`)
const _ = require(`lodash`)

// copied from https://runpkg.com/?pretty-error@2.1.1/lib/nodePaths.js
// and added `^internal/` test
const nodePaths = [
  /^_debugger.js$/,
  /^_http_agent.js$/,
  /^_http_client.js$/,
  /^_http_common.js$/,
  /^_http_incoming.js$/,
  /^_http_outgoing.js$/,
  /^_http_server.js$/,
  /^_linklist.js$/,
  /^_stream_duplex.js$/,
  /^_stream_passthrough.js$/,
  /^_stream_readable.js$/,
  /^_stream_transform.js$/,
  /^_stream_writable.js$/,
  /^_tls_legacy.js$/,
  /^_tls_wrap.js$/,
  /^assert.js$/,
  /^buffer.js$/,
  /^child_process.js$/,
  /^cluster.js$/,
  /^console.js$/,
  /^constants.js$/,
  /^crypto.js$/,
  /^dgram.js$/,
  /^dns.js$/,
  /^domain.js$/,
  /^events.js$/,
  /^freelist.js$/,
  /^fs.js$/,
  /^http.js$/,
  /^https.js$/,
  /^module.js$/,
  /^net.js$/,
  /^os.js$/,
  /^path.js$/,
  /^punycode.js$/,
  /^querystring.js$/,
  /^readline.js$/,
  /^repl.js$/,
  /^smalloc.js$/,
  /^stream.js$/,
  /^string_decoder.js$/,
  /^sys.js$/,
  /^timers.js$/,
  /^tls.js$/,
  /^tty.js$/,
  /^url.js$/,
  /^util.js$/,
  /^vm.js$/,
  /^zlib.js$/,
  /^node.js$/,
  /^internal[/\\]/,
]

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

    if (
      nodePaths.some(regTest => {
        if (regTest.test(callSite.fileName)) {
          return true
        }
        return false
      })
    ) {
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
