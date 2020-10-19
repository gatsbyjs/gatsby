import * as ReactRefreshErrorOverlay from "@pmmmwh/react-refresh-webpack-plugin/overlay"
import * as ReactErrorOverlay from "react-error-overlay"

const ErrorOverlay = {
  showCompileError:
    process.env.GATSBY_HOT_LOADER !== `fast-refresh`
      ? ReactErrorOverlay.reportBuildError
      : ReactRefreshErrorOverlay.showCompileError,
  clearCompileError:
    process.env.GATSBY_HOT_LOADER !== `fast-refresh`
      ? ReactErrorOverlay.dismissBuildError
      : ReactRefreshErrorOverlay.clearCompileError,
}

if (process.env.GATSBY_HOT_LOADER !== `fast-refresh`) {
  // Report runtime errors
  let registeredReloadListeners = false
  function onError() {
    if (registeredReloadListeners) {
      return
    }

    // Inspired by `react-dev-utils` HMR client:
    // If there was unhandled error, reload browser
    // on next HMR update
    module.hot.addStatusHandler(status => {
      if (status === `apply` || status === `idle`) {
        window.location.reload()
      }
    })

    // Additionally in Gatsby case query result updates can cause
    // runtime error and also fix them, so reload on data updates
    // as well
    ___emitter.on(`pageQueryResult`, () => {
      window.location.reload()
    })
    ___emitter.on(`staticQueryResult`, () => {
      window.location.reload()
    })

    registeredReloadListeners = true
  }
  ReactErrorOverlay.startReportingRuntimeErrors({
    onError,
    filename: `/commons.js`,
  })

  // ReactErrorOverlay `onError` handler is triggered pretty late
  // so we attach same error/unhandledrejection as ReactErrorOverlay
  // to be able to detect runtime error and setup listeners faster
  window.addEventListener(`error`, onError)
  window.addEventListener(`unhandledrejection`, onError)

  ReactErrorOverlay.setEditorHandler(errorLocation =>
    window.fetch(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(errorLocation.fileName) +
        `&lineNumber=` +
        window.encodeURIComponent(errorLocation.lineNumber || 1)
    )
  )
}

const errorMap = {}

function flat(arr) {
  return Array.prototype.flat ? arr.flat() : [].concat(...arr)
}

const handleErrorOverlay = () => {
  const errors = Object.values(errorMap)
  let errorStringsToDisplay = []
  if (errors.length > 0) {
    errorStringsToDisplay = flat(errors)
      .map(error => {
        if (typeof error === `string`) {
          return error
        } else if (typeof error === `object`) {
          const errorStrBuilder = [error.text]

          if (error.filePath) {
            errorStrBuilder.push(`File: ${error.filePath}`)
          }

          return errorStrBuilder.join(`\n\n`)
        }

        return null
      })
      .filter(Boolean)
  }

  if (errorStringsToDisplay.length > 0) {
    ErrorOverlay.showCompileError(errorStringsToDisplay.join(`\n\n`))
  } else {
    ErrorOverlay.clearCompileError()
  }
}

export const clearError = errorID => {
  delete errorMap[errorID]
  handleErrorOverlay()
}

export const reportError = (errorID, error) => {
  if (error) {
    errorMap[errorID] = error
  }
  handleErrorOverlay()
}

export { errorMap }
