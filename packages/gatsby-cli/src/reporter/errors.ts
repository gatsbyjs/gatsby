import PrettyError from "pretty-error"
import stackTrace from "stack-trace"
import { prepareStackTrace, ErrorWithCodeFrame } from "./prepare-stack-trace"
import { isNodeInternalModulePath } from "gatsby-core-utils"
import { IStructuredStackFrame } from "../structured-errors/types"
import { readFileSync } from "fs-extra"
import { codeFrameColumns } from "@babel/code-frame"

const packagesToSkip = [`core-js`, `bluebird`, `regenerator-runtime`, `graphql`]

const packagesToSkipTest = new RegExp(
  `node_modules[\\/](${packagesToSkip.join(`|`)})`
)

// TO-DO: move this this out of this file (and probably delete this file completely)
// it's here because it re-implements similar thing as `pretty-error` already does
export const sanitizeStructuredStackTrace = (
  stack: Array<stackTrace.StackFrame>
): Array<IStructuredStackFrame> => {
  // first filter out not useful call sites
  stack = stack.filter(callSite => {
    if (!callSite.getFileName()) {
      return false
    }

    if (packagesToSkipTest.test(callSite.getFileName())) {
      return false
    }

    if (callSite.getFileName().includes(`asyncToGenerator.js`)) {
      return false
    }

    if (isNodeInternalModulePath(callSite.getFileName())) {
      return false
    }

    return true
  })

  // then sanitize individual call site objects to make sure we don't
  // emit objects with extra fields that won't be handled by consumers
  return stack.map(callSite => {
    return {
      fileName: callSite.getFileName(),
      functionName: callSite.getFunctionName(),
      columnNumber: callSite.getColumnNumber(),
      lineNumber: callSite.getLineNumber(),
    }
  })
}

type PrettyRenderError = Error | ErrorWithCodeFrame

export function getErrorFormatter(): PrettyError {
  const prettyError = new PrettyError()
  const baseRender = prettyError.render

  prettyError.skipNodeFiles()
  prettyError.skipPackage(
    `regenerator-runtime`,
    `graphql`,
    `core-js`
    // `static-site-generator-webpack-plugin`,
    // `tapable`, // webpack
  )

  // @ts-ignore the type defs in prettyError are wrong
  prettyError.skip((traceLine: any) => {
    if (traceLine && traceLine.file === `asyncToGenerator.js`) return true
    return false
  })

  prettyError.appendStyle({
    "pretty-error": {
      marginTop: 1,
    },
    "pretty-error > header": {
      background: `red`,
    },
    "pretty-error > header > colon": {
      color: `white`,
    },
  })

  if (process.env.FORCE_COLOR === `0`) {
    prettyError.withoutColors()
  }

  prettyError.render = (
    err: PrettyRenderError | Array<PrettyRenderError>
  ): string => {
    if (Array.isArray(err)) {
      return err.map(e => prettyError.render(e)).join(`\n`)
    }

    let rendered = baseRender.call(prettyError, err)
    if (`codeFrame` in err) rendered = `\n${err.codeFrame}\n${rendered}`
    return rendered
  }
  return prettyError
}

type ErrorWithPotentialForcedLocation = Error & {
  forcedLocation?: {
    fileName: string
    lineNumber?: number
    columnNumber?: number
    endLineNumber?: number
    endColumnNumber?: number
    functionName?: string
  }
}

/**
 * Convert a stringified webpack compilation error back into
 * an Error instance so it can be formatted properly
 */
export function createErrorFromString(
  errorOrErrorStack: string | ErrorWithPotentialForcedLocation = ``,
  sourceMapFile: string
): ErrorWithCodeFrame {
  if (typeof errorOrErrorStack === `string`) {
    const errorStr = errorOrErrorStack
    let [message, ...rest] = errorStr.split(/\r\n|[\n\r]/g)
    // pull the message from the first line then remove the `Error:` prefix
    // FIXME: when https://github.com/AriaMinaei/pretty-error/pull/49 is merged

    message = message.replace(/^(Error:)/, ``)

    const error = new Error(message)

    error.stack = [message, rest.join(`\n`)].join(`\n`)

    error.name = `WebpackError`
    try {
      if (sourceMapFile) {
        return prepareStackTrace(error, sourceMapFile)
      }
    } catch (err) {
      // don't shadow a real error because of a parsing issue
    }
    return error
  } else {
    if (errorOrErrorStack.forcedLocation) {
      const forcedLocation = errorOrErrorStack.forcedLocation
      const error = new Error(errorOrErrorStack.message) as ErrorWithCodeFrame
      error.stack = `${errorOrErrorStack.message}
  at ${forcedLocation.functionName ?? `<anonymous>`} (${
        forcedLocation.fileName
      }${
        forcedLocation.lineNumber
          ? `:${forcedLocation.lineNumber}${
              forcedLocation.columnNumber
                ? `:${forcedLocation.columnNumber}`
                : ``
            }`
          : ``
      })`

      try {
        const source = readFileSync(forcedLocation.fileName, `utf8`)

        error.codeFrame = codeFrameColumns(
          source,
          {
            start: {
              line: forcedLocation.lineNumber ?? 0,
              column: forcedLocation.columnNumber ?? 0,
            },
            end: forcedLocation.endColumnNumber
              ? {
                  line: forcedLocation.endLineNumber ?? 0,
                  column: forcedLocation.endColumnNumber ?? 0,
                }
              : undefined,
          },
          {
            highlightCode: true,
          }
        )
      } catch (e) {
        // failed to generate codeframe, we still should show an error so we keep going
      }

      return error
    } else {
      return createErrorFromString(errorOrErrorStack.stack, sourceMapFile)
    }
  }
}
