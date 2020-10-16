import report from "gatsby-cli/lib/reporter"
import path from "path"
import fs from "fs-extra"
import { codeFrameColumns } from "@babel/code-frame"
import ansiHTML from "ansi-html"

import { renderHTML } from "./worker/render-html"
import { Stage } from "../commands/types"

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
  const filename = path.join(
    directory,
    ...position.filename.split(path.sep).slice(2)
  )

  const code = fs.readFileSync(filename, `utf-8`)
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

export const route = ({ app, program, store }) =>
  // Render an HTML page and serve it.
  app.get(`*`, async (req, res, next) => {
    const { pages } = store.getState()

    if (!pages.has(req.path)) {
      return next()
    }

    const htmlActivity = report.phantomActivity(`building HTML for path`, {})
    htmlActivity.start()

    try {
      const renderResponse = await renderHTML({
        htmlComponentRendererPath: `${program.directory}/public/render-page.js`,
        paths: [req.path],
        stage: Stage.DevelopHTML,
        envVars: [
          [`NODE_ENV`, process.env.NODE_ENV || ``],
          [
            `gatsby_executing_command`,
            process.env.gatsby_executing_command || ``,
          ],
          [`gatsby_log_level`, process.env.gatsby_log_level || ``],
        ],
      })
      res.status(200).send(renderResponse[0])
    } catch (e) {
      const error = parseError(e, program.directory)
      res.status(500).send(`<title>Develop SSR Error</title><h1>Error<h1>
        <h2>The page didn't SSR correctly</h2>
        <ul>
          <li><strong>URL path:</strong> <code>${req.path}</code></li>
          <li><strong>File path:</strong> <code>${error.filename}</code></li>
        </ul>
        <h3>error message</h3>
        <p><code>${error.message}</code></p>
        <pre style="background:#${colors.background};padding:8px;">${error.codeFrame}</pre>`)
    }

    // TODO add support for 404 and general rendering errors
    htmlActivity.end()

    // Make eslint happy
    return null
  })
