const stackTrace = require(`stack-trace`)
const { codeFrameColumns } = require(`@babel/code-frame`)
const fs = require(`fs-extra`)
const path = require(`path`)
const chalk = require(`chalk`)

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

const gatsbyLocation = path.dirname(require.resolve(`gatsby/package.json`))
const reduxThunkLocation = path.dirname(
  require.resolve(`redux-thunk/package.json`)
)
const reduxLocation = path.dirname(require.resolve(`redux/package.json`))

const getNonGatsbyCallSite = () =>
  stackTrace
    .get()
    .find(
      callSite =>
        callSite &&
        callSite.getFileName() &&
        !callSite.getFileName().includes(gatsbyLocation) &&
        !callSite.getFileName().includes(reduxLocation) &&
        !callSite.getFileName().includes(reduxThunkLocation) &&
        !nodePaths.some(regTest => regTest.test(callSite.getFileName()))
    )

const getNonGatsbyCodeFrame = ({ highlightCode = true } = {}) => {
  const callSite = getNonGatsbyCallSite()
  if (!callSite) {
    return null
  }

  const fileName = callSite.getFileName()
  const line = callSite.getLineNumber()
  const column = callSite.getColumnNumber()

  const code = fs.readFileSync(fileName, { encoding: `utf-8` })
  return {
    fileName,
    line,
    column,
    codeFrame: codeFrameColumns(
      code,
      {
        start: {
          line,
          column,
        },
      },
      {
        highlightCode,
      }
    ),
  }
}

const getNonGatsbyCodeFrameFormatted = ({ highlightCode = true } = {}) => {
  const possibleCodeFrame = getNonGatsbyCodeFrame({
    highlightCode,
  })

  if (!possibleCodeFrame) {
    return null
  }

  const { fileName, line, column, codeFrame } = possibleCodeFrame
  return `File ${chalk.bold(`${fileName}:${line}:${column}`)}\n${codeFrame}`
}

module.exports = {
  getNonGatsbyCodeFrame,
  getNonGatsbyCodeFrameFormatted,
}
