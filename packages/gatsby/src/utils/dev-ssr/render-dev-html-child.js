require(`source-map-support`).install()
const { codeFrameColumns } = require(`@babel/code-frame`)
const ansiHTML = require(`ansi-html`)
const fs = require(`fs-extra`)
const sysPath = require(`path`)
const { slash } = require(`gatsby-core-utils`)

const getPosition = function (stackObject) {
  let filename
  let line
  let row
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
    row = Number(splitLine[splitLength - 1])
  } catch (err) {
    filename = ``
    line = 0
    row = 0
  }
  return {
    filename,
    line,
    row,
  }
}
// Colors taken from Gatsby's design tokens
// https://github.com/gatsbyjs/gatsby/blob/d8acab3a135fa8250a0eb3a47c67300dde6eae32/packages/gatsby-design-tokens/src/colors.js#L185-L205
const colors = {
  background: `fdfaf6`,
  text: `452475`,
  green: `137886`,
  darkGreen: `006500`,
  comment: `527713`,
  keyword: `096fb3`,
  yellow: `DB3A00`,
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
  const data = {
    filename: slash(sysPath.relative(directory, trueFileName)),
    message: message,
    type: type,
    stack: stack,
  }

  // Try to generate a codeFrame
  try {
    const code = fs.readFileSync(filename, `utf-8`)
    const line = position.line
    const row = position.row
    ansiHTML.setColors({
      reset: [colors.text, `ffffff`], // [FOREGROUND-COLOR, BACKGROUND-COLOR]
      black: `aaa`, // String
      red: colors.keyword,
      green: colors.green,
      yellow: colors.yellow,
      blue: `eee`,
      magenta: `fff`,
      cyan: colors.darkGreen,
      lightgrey: `888`,
      darkgrey: colors.comment,
    })
    const codeFrame = ansiHTML(
      codeFrameColumns(
        code,
        {
          start: { line: line, column: row },
        },
        { forceColor: true }
      )
    )

    data.line = line
    data.row = row
    data.codeFrame = codeFrame
  } catch (e) {
    console.log(
      `Couldn't read the file ${filename}, possibly due to source maps failing`
    )
    console.log(`original error`, err)
  }

  return data
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
      console.log(`2`, { publicDir })
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
      const stack = err.stack ? err.stack : ``

      // Only generate error pages for webpack errors. If it's not a webpack
      // error, it's not a user error so probably a system error so we'll just
      // panic and quit.
      const regex = /webpack:[/\\]/gm
      const moduleBuildFailed = /Module.build.failed/gm
      if (stack.match(moduleBuildFailed)) {
        reject(`500 page`)
      } else if (!stack.match(regex)) {
        console.log(`unexpected error while SSRing the path: ${path}`)
        console.log(err)
        reject(err)
      } else {
        const error = parseError({ err, directory, componentPath })
        reject(error)
      }
    }
  })

exports.deleteModuleCache = htmlComponentRendererPath => {
  delete require.cache[require.resolve(htmlComponentRendererPath)]
}

exports.warmup = () => `warmed`
