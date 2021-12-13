import stackTrace, { StackFrame } from "stack-trace"
import { codeFrameColumns } from "@babel/code-frame"
import {
  NullableMappedPosition,
  SourceMapConsumer,
  RawSourceMap,
  RawIndexMap,
} from "source-map"

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

  const code = fs.readFileSync(fileName, { encoding: `utf-8` })
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
  sourcePosition: NullableMappedPosition | null
  sourceContent: string | null
}

export async function findOriginalSourcePositionAndContent(
  webpackSource: RawSourceMap | RawIndexMap | string,
  position: { line: number; column: number | null }
): Promise<IOriginalSourcePositionAndContent> {
  return await SourceMapConsumer.with(webpackSource, null, consumer => {
    const sourcePosition = consumer.originalPositionFor({
      line: position.line,
      column: position.column ?? 0,
    })

    if (!sourcePosition.source) {
      return {
        sourcePosition: null,
        sourceContent: null,
      }
    }

    const sourceContent: string | null =
      consumer.sourceContentFor(sourcePosition.source, true) ?? null

    return {
      sourcePosition,
      sourceContent,
    }
  })
}
