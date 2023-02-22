/* global __prefresh_errors__ */
/* eslint-disable camelcase */
import formatWebpackErrors from "./formatWebpackErrors"

const singletonKey = `__webpack_hot_middleware_reporter__`
let hasRuntimeErrors = false

function messageHandler(message) {
  switch (message.type) {
    case `ok`:
    case `still-ok`:
    case `warnings`: {
      __prefresh_errors__.clearCompileError()
      __prefresh_errors__.clearRuntimeErrors(!hasRuntimeErrors)
      hasRuntimeErrors = false
      break
    }
    case `errors`: {
      const formattedErrors = formatWebpackErrors(message.data)
      __prefresh_errors__.showCompileError(formattedErrors[0])
      break
    }
    default: {
      // Do nothing.
    }
  }
}

module.exports = function setupPrefresh() {
  if (process.env.NODE_ENV !== `production`) {
    require(`preact/debug`)
  }

  const client =
    window[singletonKey] || require(`@gatsbyjs/webpack-hot-middleware/client`)

  client.useCustomOverlay({
    showProblems: function showProblems(type, data) {
      const error = {
        data: data,
        type: type,
      }

      messageHandler(error)
    },
    clear: function clear() {
      messageHandler({ type: `ok` })
    },
  })

  window.addEventListener(`error`, function handleError(e) {
    hasRuntimeErrors = true
    if (!e || !e.error) {
      __prefresh_errors__.handleRuntimeError(new Error(`Unknown`))
      return
    }
    if (e.error instanceof Error) {
      __prefresh_errors__.handleRuntimeError(e.error)
      return
    }

    // A non-error was thrown, we don't have a trace. :(
    // Look in your browser's devtools for more information
    __prefresh_errors__.handleRuntimeError(new Error(e.error))
  })

  window.addEventListener(`unhandledRejection`, function handleError(e) {
    hasRuntimeErrors = true
    if (!e || !e.reason) {
      __prefresh_errors__.handleRuntimeError(new Error(`Unknown`))
      return
    }
    if (e.reason instanceof Error) {
      __prefresh_errors__.handleRuntimeError(e.reason)
      return
    }

    // A non-error was rejected, we don't have a trace :(
    // Look in your browser's devtools for more information
    __prefresh_errors__.handleRuntimeError(new Error(e.reason))
  })
}
