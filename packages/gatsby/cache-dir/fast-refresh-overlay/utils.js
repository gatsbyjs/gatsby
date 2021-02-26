import Anser from "anser"

const enterRegex = /^\s$/

export function prettifyStack(errorInformation) {
  let txt
  if (Array.isArray(errorInformation)) {
    txt = errorInformation.join(`\n`)
  } else {
    txt = errorInformation
  }
  const generated = Anser.ansiToJson(txt, {
    remove_empty: true,
    use_classes: true,
    json: true,
  })
  // Sometimes the first line/entry is an "Enter", so we need to filter this out
  const [firstLine, ...rest] = generated
  if (enterRegex.test(firstLine.content)) {
    return rest
  }
  return generated
}

export function openInEditor(file, lineNumber = 1) {
  window.fetch(
    `/__open-stack-frame-in-editor?fileName=` +
      window.encodeURIComponent(file) +
      `&lineNumber=` +
      window.encodeURIComponent(lineNumber)
  )
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
