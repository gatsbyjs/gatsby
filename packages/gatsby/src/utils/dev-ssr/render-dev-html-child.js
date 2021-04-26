const sysPath = require(`path`)
const { slash } = require(`gatsby-core-utils`)

const getPosition = function (stackObject) {
  let filename
  let line
  let column
  // Because the JavaScript error stack has not yet been standardized,
  // wrap the stack parsing in a try/catch for a soft fail if an
  // unexpected stack is encountered.
  try {
    const filteredStack = stackObject.filter(function (s) {
      return /\(.+?\)$/.test(s)
    })
    let splitLine
    // For current Node & Chromium Error stacks
    if (filteredStack.length > 0) {
      splitLine = filteredStack[0].match(/(?:\()(.+?)(?:\))$/)[1].split(`:`)
      // For older, future, or otherwise unexpected stacks
    } else {
      splitLine = stackObject[0].split(`:`)
    }
    const splitLength = splitLine.length
    filename = splitLine[splitLength - 3]
    line = Number(splitLine[splitLength - 2])
    column = Number(splitLine[splitLength - 1])
  } catch (err) {
    filename = ``
    line = 0
    column = 0
  }
  return {
    filename,
    line,
    column,
  }
}

// Code borrowed and modified from https://github.com/watilde/parse-error
const parseError = function ({ err, directory, componentPath }) {
  const stack = err.stack ? err.stack : ``
  const stackObject = stack.split(`\n`)
  const position = getPosition(stackObject)

  // Remove the `/lib/` added by webpack
  const filename = sysPath.join(
    directory,
    // Don't need to use path.sep as webpack always uses a single forward slash
    // as a path separator.
    ...position.filename.split(sysPath.sep).slice(2)
  )

  const splitMessage = err.message ? err.message.split(`\n`) : [``]
  const message = splitMessage[splitMessage.length - 1]
  const type = err.type ? err.type : err.name

  // We prefer the file path from the stack trace as the error might not be in the
  // component — but if source-maps fail and we just get public/render-page.js as
  // the file, we fall back on the component filepath as at least the user
  // will have that.
  const trueFileName = filename.includes(`render-page`)
    ? componentPath
    : filename

  return {
    filename: slash(sysPath.relative(directory, trueFileName)),
    message: message,
    type: type,
    stack: stack,
    line: position.line,
    column: position.column,
  }
}

exports.parseError = parseError

exports.renderHTML = ({
  path,
  componentPath,
  htmlComponentRendererPath,
  publicDir,
  isClientOnlyPage = false,
  directory,
}) =>
  new Promise((resolve, reject) => {
    try {
      const htmlComponentRenderer = require(htmlComponentRendererPath)
      if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
        htmlComponentRenderer.default(
          path,
          isClientOnlyPage,
          publicDir,
          (_throwAway, htmlString) => {
            resolve(htmlString)
          }
        )
      } else {
        htmlComponentRenderer.default(path, (_throwAway, htmlString) => {
          resolve(htmlString)
        })
      }
    } catch (err) {
      console.log({ err, componentPath, directory, path })

      const error = parseError({ err, directory, componentPath })
      reject(error)
    }
  })

exports.deleteModuleCache = htmlComponentRendererPath => {
  delete require.cache[require.resolve(htmlComponentRendererPath)]
}

exports.warmup = () => `warmed`
