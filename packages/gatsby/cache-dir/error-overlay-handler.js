import * as ErrorOverlay from "react-error-overlay"

export const ERROR_TYPES = {
  GENERIC: `GENERIC`,
  QUERY: `QUERY`,
}

const ERRORS = {
  GENERIC: [],
  QUERY: [],
}

// Report runtime errors
ErrorOverlay.startReportingRuntimeErrors({
  onError: () => {},
  filename: `/commons.js`,
})
ErrorOverlay.setEditorHandler(errorLocation =>
  window.fetch(
    `/__open-stack-frame-in-editor?fileName=` +
      window.encodeURIComponent(errorLocation.fileName) +
      `&lineNumber=` +
      window.encodeURIComponent(errorLocation.lineNumber || 1)
  )
)

export function clearErrorOverlay(type, clearCondition = true) {
  ERRORS[type] = []
  if (clearCondition && !ERRORS.GENERIC.length && !ERRORS.QUERY.length) {
    ErrorOverlay.dismissBuildError()
    return true
  }
  return false
}

export const reportErrorOverlay = (type) => (error, { clearCondition, callback }) => {
  if (error) {
    ERRORS[type].push(error)
  }
  if (!error && clearErrorOverlay(type, clearCondition)) {
    return
  }
  if (ERRORS.GENERIC.length) {
    ErrorOverlay.reportBuildError(ERRORS.GENERIC[0])
  }
  if(ERRORS.QUERY.length) {
    ErrorOverlay.reportBuildError(ERRORS.QUERY[0])
  }
  if (callback && typeof callback === `function`) {
    callback()
  }
}

export const reportQueryErrorOverlay = reportErrorOverlay(ERROR_TYPES.QUERY)

export const reportGenericErrorOverlay = reportErrorOverlay(ERROR_TYPES.GENERIC)
