import { createErrorFromString } from "gatsby-cli/lib/reporter/errors"

const sysPath = require(`path`)
const fs = require(`fs-extra`)
const { slash } = require(`gatsby-core-utils`)

const getPosition = function (stackObject: Array<string>): {
  filename: string
  line: number
  column: number
} {
  let filename = ``
  let line = 0
  let column = 0
  // Because the JavaScript error stack has not yet been standardized,
  // wrap the stack parsing in a try/catch for a soft fail if an
  // unexpected stack is encountered.
  try {
    for (const stackLine of stackObject) {
      {
        // testing for following format:
        // "    at Component (/Users/misiek/dev/gatsby/integration-tests/ssr/.cache/page-ssr/routes/render-page.js:4088:13)"
        const splitLine = stackLine.match(/(?:\()(.+):([0-9]+):([0-9]+)(?:\))$/)
        if (splitLine) {
          filename = splitLine[1]
          line = Number(splitLine[2])
          column = Number(splitLine[3])
          break
        }
      }

      {
        // testing for following format:
        // "    at ssr/src/pages/bad-page.js:4:13"
        const splitLine = stackLine.match(/at (.+):([0-9]+):([0-9]+)$/)
        if (splitLine) {
          filename = splitLine[1]
          line = Number(splitLine[2])
          column = Number(splitLine[3])
          break
        }
      }

      {
        // trying to extract generic:
        // "<filepath>:<line>:<column>"
        const splitLine = stackLine.match(/(.+):([0-9]+):([0-9]+)/)
        if (splitLine) {
          filename = splitLine[1]
          line = Number(splitLine[2])
          column = Number(splitLine[3])
          break
        }
      }
    }
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

export interface IParsedError {
  filename: string
  sourceContent: string
  message: string
  stack: string
  line: number
  column: number
}

export interface IErrorRenderMeta {
  codeFrame: string
  source: string
  line: number
  column: number
  sourceMessage?: string
  stack?: string
}

// Code borrowed and modified from https://github.com/watilde/parse-error
export const parseError = function ({
  err,
  directory,
  componentPath,
  htmlComponentRendererPath,
}: {
  err: Error
  directory: string
  componentPath: string
  htmlComponentRendererPath: string
}): IParsedError {
  // convert stack trace to use source file locations and not compiled ones
  err = createErrorFromString(err.stack, `${htmlComponentRendererPath}.map`)

  const stack = err.stack ? err.stack : ``
  const stackObject = stack.split(`\n`)
  const position = getPosition(stackObject)

  // Remove the `/lib/` added by webpack
  const filename = sysPath.join(
    directory,
    // Don't need to use path.sep as webpack always uses a single forward slash
    // as a path separator.
    ...position.filename
      .split(sysPath.sep)
      .slice(position.filename.startsWith(`/`) ? 2 : 1)
  )

  let sourceContent
  try {
    sourceContent = fs.readFileSync(filename, `utf-8`)
  } catch (e) {
    sourceContent = null
  }

  // We prefer the file path from the stack trace as the error might not be in the
  // component — but if source-maps fail and we just get public/render-page.js as
  // the file, we fall back on the component filepath as at least the user
  // will have that.
  const trueFileName = filename.includes(`render-page`)
    ? componentPath
    : filename

  return {
    filename: slash(sysPath.relative(directory, trueFileName)),
    sourceContent,
    message: err.message,
    stack: stack,
    line: position.line,
    column: position.column,
  }
}
