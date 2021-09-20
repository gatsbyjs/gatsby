import Anser from "anser"

export function prettifyStack(errorInformation) {
  let txt
  if (Array.isArray(errorInformation)) {
    txt = errorInformation.join(`\n`)
  } else {
    txt = errorInformation
  }
  return Anser.ansiToJson(txt, {
    remove_empty: true,
    use_classes: true,
    json: true,
  })
}

export function openInEditor(file, lineNumber = 1) {
  fetch(
    `/__open-stack-frame-in-editor?fileName=` +
      window.encodeURIComponent(file) +
      `&lineNumber=` +
      window.encodeURIComponent(lineNumber)
  )
}

export function reloadPage() {
  window.location.reload()
}

export function skipSSR() {
  if (`URLSearchParams` in window) {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(`skip-ssr`, `true`)
    window.location.search = searchParams.toString()
  }
}

export function getCodeFrameInformation(stackTrace) {
  const callSite = stackTrace.find(CallSite => CallSite.getFileName())
  if (!callSite) {
    return null
  }

  const moduleId = formatFilename(callSite.getFileName())
  const lineNumber = callSite.getLineNumber()
  const columnNumber = callSite.getColumnNumber()
  const functionName = callSite.getFunctionName()

  return {
    moduleId,
    lineNumber,
    columnNumber,
    functionName,
  }
}

const lineNumberRegex = /^[0-9]*:[0-9]*$/g

export function getLineNumber(error) {
  const match = error.match(lineNumberRegex)

  return match?.[1]
}

export function formatFilename(filename) {
  const htmlMatch = /^https?:\/\/(.*)\/(.*)/.exec(filename)
  if (htmlMatch && htmlMatch[1] && htmlMatch[2]) {
    return htmlMatch[2]
  }

  const sourceMatch = /^webpack-internal:\/\/\/(.*)$/.exec(filename)
  if (sourceMatch && sourceMatch[1]) {
    return sourceMatch[1]
  }

  return filename
}
