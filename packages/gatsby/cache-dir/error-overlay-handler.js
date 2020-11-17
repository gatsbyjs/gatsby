const overlayPackage =
  process.env.GATSBY_HOT_LOADER !== `fast-refresh`
    ? require(`react-error-overlay`)
    : require(`@pmmmwh/react-refresh-webpack-plugin/overlay`)

const ErrorOverlay = {
  showCompileError:
    process.env.GATSBY_HOT_LOADER !== `fast-refresh`
      ? overlayPackage.reportBuildError
      : overlayPackage.showCompileError,
  clearCompileError:
    process.env.GATSBY_HOT_LOADER !== `fast-refresh`
      ? overlayPackage.dismissBuildError
      : overlayPackage.clearCompileError,
}

if (process.env.GATSBY_HOT_LOADER !== `fast-refresh`) {
  // Report runtime errors
  overlayPackage.startReportingRuntimeErrors({
    onError: () => {},
    filename: `/commons.js`,
  })
  overlayPackage.setEditorHandler(errorLocation =>
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
