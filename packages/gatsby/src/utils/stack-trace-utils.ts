import stackTrace, { StackFrame } from "stack-trace"
import url from "url"
import { codeFrameColumns } from "@babel/code-frame"
import {
  TraceMap,
  originalPositionFor,
  OriginalMapping,
  SourceMapInput,
  sourceContentFor,
} from "@jridgewell/trace-mapping"

const fs = require(`fs-extra`)
const path = require(`path`)
const chalk = require(`chalk`)
const { isNodeInternalModulePath } = require(`gatsby-core-utils`)

const getDirName = (arg: unknown): string => {
  // Caveat related to executing in engines:
  // After webpack bundling we would get number here (webpack module id) and that would crash when doing
  // path.dirname(number).
  if (typeof arg === `string`) {
    return path.dirname(arg)
  }
  return `-cant-resolve-`
}

const gatsbyLocation = getDirName(require.resolve(`gatsby/package.json`))
const reduxThunkLocation = getDirName(
  require.resolve(`redux-thunk/package.json`)
)
const reduxLocation = getDirName(require.resolve(`redux/package.json`))

const getNonGatsbyCallSite = (): StackFrame | undefined =>
  stackTrace
    .get()
    .find(
      callSite =>
        callSite &&
        callSite.getFileName() &&
        !callSite.getFileName().includes(gatsbyLocation) &&
        !callSite.getFileName().includes(reduxLocation) &&
        !callSite.getFileName().includes(reduxThunkLocation) &&
        !isNodeInternalModulePath(callSite.getFileName())
    )

interface ICodeFrame {
  fileName: string
  line: number
  column: number
  codeFrame: string
}

export const getNonGatsbyCodeFrame = ({
  highlightCode = true,
  stack,
}: {
  highlightCode?: boolean
  stack?: string
} = {}): null | ICodeFrame => {
  let callSite
  if (stack) {
    callSite = stackTrace.parse({ stack, name: ``, message: `` })[0]
  } else {
    callSite = getNonGatsbyCallSite()
  }

  if (!callSite) {
    return null
  }

  const fileName = callSite.getFileName()
  const line = callSite.getLineNumber()
  const column = callSite.getColumnNumber()

  const normalizedFileName = fileName.startsWith(`file://`)
    ? url.fileURLToPath(fileName)
    : fileName

  try {
    const code = fs.readFileSync(normalizedFileName, { encoding: `utf-8` })
    return {
      fileName,
      line,
      column,
      codeFrame: codeFrameColumns(
        code,
        {
          start: {
            line,
            column,
          },
        },
        {
          highlightCode,
        }
      ),
    }
  } catch (e) {
    console.error(`Errored getting code frame: ${e.stack}`)
    return null
  }
}

export const getNonGatsbyCodeFrameFormatted = ({
  highlightCode = true,
  stack,
}: {
  highlightCode?: boolean
  stack?: string
} = {}): null | string => {
  const possibleCodeFrame = getNonGatsbyCodeFrame({
    highlightCode,
    stack,
  })

  if (!possibleCodeFrame) {
    return null
  }

  const { fileName, line, column, codeFrame } = possibleCodeFrame
  return `File ${chalk.bold(`${fileName}:${line}:${column}`)}\n${codeFrame}`
}

interface IOriginalSourcePositionAndContent {
  sourcePosition: OriginalMapping | null
  sourceContent: string | null
}

export function findOriginalSourcePositionAndContent(
  webpackSource: SourceMapInput | string,
  position: { line: number; column: number | null }
): IOriginalSourcePositionAndContent {
  const tracer = new TraceMap(webpackSource)
  const sourcePosition = originalPositionFor(tracer, {
    line: position.line,
    column: position.column ?? 0,
  })

  if (!sourcePosition.source) {
    return {
      sourcePosition: null,
      sourceContent: null,
    }
  }

  const sourceContent = sourceContentFor(tracer, sourcePosition.source)

  return {
    sourcePosition,
    sourceContent,
  }
}
