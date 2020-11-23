import React from "react"
import StackTrace from "stack-trace"
import Overlay from "./overlay"
import { prettifyStack } from "../utils"
import CodeFrame from "./code-frame"

function formatFilename(filename) {
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

const useFetch = url => {
  const [response, setResponse] = React.useState({
    decoded: null,
    sourcePosition: {
      line: null,
      number: null,
    },
    sourceContent: null,
  })
  React.useEffect(() => {
    async function fetchData() {
      const res = await fetch(url)
      const json = await res.json()
      const decoded = prettifyStack(json.codeFrame)
      const { sourcePosition, sourceContent } = json
      setResponse({
        decoded,
        sourceContent,
        sourcePosition,
      })
    }
    fetchData()
  }, [])
  return response
}

function getCodeFrameInformation(stackTrace) {
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

const RuntimeError = ({ error, open, dismiss }) => {
  const stacktrace = StackTrace.parse(error.error)
  const {
    moduleId,
    lineNumber,
    columnNumber,
    functionName,
  } = getCodeFrameInformation(stacktrace)

  const res = useFetch(
    `/__original-stack-frame?moduleId=` +
      window.encodeURIComponent(moduleId) +
      `&lineNumber=` +
      window.encodeURIComponent(lineNumber) +
      `&columnNumber=` +
      window.encodeURIComponent(columnNumber)
  )

  const header = (
    <>
      <div data-gatsby-overlay="header__cause-file">
        <p>Unhandled Runtime Error</p>
        <span>{moduleId}</span>
      </div>
      <button
        onClick={() => open(moduleId, res.sourcePosition.line)}
        data-gatsby-overlay="header__open-in-editor"
      >
        Open in editor
      </button>
    </>
  )
  const body = (
    <>
      <p data-gatsby-overlay="body__error-message-header">
        Error in function <span data-font-weight="bold">{functionName}</span>
      </p>
      <p data-gatsby-overlay="body__error-message">{error.error.message}</p>
      <CodeFrame decoded={res.decoded} />
    </>
  )

  return <Overlay header={header} body={body} dismiss={dismiss} />
}

export default RuntimeError
