/* Code borrowed and based on
 * https://github.com/evanw/node-source-map-support/blob/master/source-map-support.js
 */

const { readFileSync } = require(`fs`)
const babelCodeFrame = require(`babel-code-frame`)
const stackTrace = require(`stack-trace`)
const { SourceMapConsumer } = require(`source-map`)

module.exports = function prepareStackTrace(error, source) {
  const map = new SourceMapConsumer(readFileSync(source, `utf8`))
  const stack = stackTrace
    .parse(error)
    .map(frame => wrapCallSite(map, frame))
    .filter(
      frame =>
        !frame.getFileName() ||
        !frame.getFileName().match(/^webpack:\/+webpack\//)
    )

  error.codeFrame = getErrorSource(map, stack[0])
  error.stack =
    `${error.name}: ${error.message}\n` +
    stack.map(frame => `    at ${frame}`).join(`\n`)
}

function getErrorSource(map, topFrame) {
  let source = map.sourceContentFor(topFrame.getFileName(), true)
  return (
    source &&
    babelCodeFrame(
      source,
      topFrame.getLineNumber(),
      topFrame.getColumnNumber(),
      {
        highlightCode: true,
      }
    )
  )
}

function wrapCallSite(map, frame) {
  let source = frame.getFileName()
  if (!source) return frame

  let position = getPosition(map, frame)
  if (!position.source) return frame

  frame.getFileName = () => position.source
  frame.getLineNumber = () => position.line
  frame.getColumnNumber = () => position.column + 1
  frame.getScriptNameOrSourceURL = () => position.source
  frame.toString = CallSiteToString
  return frame
}

function getPosition(map, frame) {
  let source = frame.getFileName()
  let line = frame.getLineNumber()
  let column = frame.getColumnNumber()
  return map.originalPositionFor({ source, line, column })
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js.
function CallSiteToString() {
  let fileName
  let fileLocation = ``
  if (this.isNative()) {
    fileLocation = `native`
  } else {
    fileName =
      (this.scriptNameOrSourceURL && this.scriptNameOrSourceURL()) ||
      this.getFileName()

    if (!fileName && this.isEval && this.isEval()) {
      fileLocation = `${this.getEvalOrigin()}, `
    }

    if (fileName) {
      fileLocation += fileName.replace(/^webpack:\/+/, ``)
    } else {
      // Source code does not originate from a file and is not native, but we
      // can still get the source position inside the source string, e.g. in
      // an eval string.
      fileLocation += `<anonymous>`
    }
    let lineNumber = this.getLineNumber()
    if (lineNumber != null) {
      fileLocation += `:${lineNumber}`
      let columnNumber = this.getColumnNumber()
      if (columnNumber) {
        fileLocation += `:${columnNumber}`
      }
    }
  }

  let line = ``
  let functionName = this.getFunctionName()
  let addSuffix = true
  let isConstructor = this.isConstructor && this.isConstructor()
  let methodName = this.getMethodName()
  let typeName = this.getTypeName()
  let isMethodCall =
    methodName && !((this.isToplevel && this.isToplevel()) || isConstructor)
  if (isMethodCall && functionName) {
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += `${typeName}.`
      }
      line += functionName
      if (
        methodName &&
        functionName.indexOf(`.` + methodName) !=
          functionName.length - methodName.length - 1
      ) {
        line += ` [as ${methodName}]`
      }
    } else {
      line += typeName + `.` + (methodName || `<anonymous>`)
    }
  } else if (typeName && !functionName) {
    line += typeName + `.` + (methodName || `<anonymous>`)
  } else if (isConstructor) {
    line += `new ` + (functionName || `<anonymous>`)
  } else if (functionName) {
    line += functionName
  } else {
    line += fileLocation
    addSuffix = false
  }
  if (addSuffix) line += ` (${fileLocation})`
  return line
}
