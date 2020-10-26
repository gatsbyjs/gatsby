import { codeFrameColumns } from "@babel/code-frame"
import ansiHTML from "ansi-html"
import fs from "fs-extra"
import sysPath from "path"
import report from "gatsby-cli/lib/reporter"

interface IErrorPosition {
  filename: string
  line: number
  row: number
}

const getPosition = function (stackObject): IErrorPosition {
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
    filename: filename,
    line: line,
    row: row,
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

interface IParsedError {
  filename: string
  code: string
  codeFrame: string
  line: number
  row: number
  message: string
  type: string
  stack: [string]
}

// Code borrowed and modified from https://github.com/watilde/parse-error
export const parseError = function (err, directory): IParsedError {
  const stack = err.stack ? err.stack : ``
  const stackObject = stack.split(`\n`)
  const position = getPosition(stackObject)

  // Remove the `/lib/` added by webpack
  const filename = sysPath.join(
    directory,
    // Don't need to use path.sep as webpack always uses a single forward slash
    // as a path seperator.
    ...position.filename.split(`/`).slice(2)
  )

  let code
  try {
    code = fs.readFileSync(filename, `utf-8`)
  } catch (e) {
    console.log(err)
    report.error(`Couldn't read the file ${filename}`, e)
  }
  const line = position.line
  const row = position.row
  ansiHTML.setColors({
    reset: [colors.text, colors.background], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
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
  const splitMessage = err.message ? err.message.split(`\n`) : [``]
  const message = splitMessage[splitMessage.length - 1]
  const type = err.type ? err.type : err.name
  const data = {
    filename: filename,
    code,
    codeFrame,
    line: line,
    row: row,
    message: message,
    type: type,
    stack: stack,
  }
  return data
}

export function renderHTML({ path, htmlComponentRendererPath, directory }) {
  return new Promise((resolve, reject) => {
    console.log(`inside worker`, { path, htmlComponentRendererPath, directory })
    const htmlComponentRenderer = require(htmlComponentRendererPath)
    try {
      console.time(`SSR`)
      htmlComponentRenderer.default(path, (_throwAway, htmlString) => {
        resolve(htmlString)
        console.timeEnd(`SSR`)
      })
    } catch (err) {
      const stack = err.stack ? err.stack : ``
      // Only generate error pages for webpack errors. If it's not a webpack
      // error, it's not a user error so probably a system error so we'll just
      // panic and quit.
      const regex = /webpack:\/lib\//gm
      if (!stack.match(regex)) {
        report.panic(err)
        return
      }
      const error = parseError(err, directory)
      reject(error)
      // return { error }
    }
  })
}
