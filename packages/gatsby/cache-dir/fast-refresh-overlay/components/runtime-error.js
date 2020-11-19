import React from "react"
import StackTrace from "stack-trace"
// import { codeFrameColumns } from "@babel/code-frame"
import Overlay from "./overlay"

function formatFilename(filename) {
  const htmlMatch = /^https?:\/\/(.*)\/(.*)/.exec(filename)
  if (htmlMatch && htmlMatch[1] && htmlMatch[2]) {
    return htmlMatch[2]
  }

  const sourceMatch = /\/.*?([^./]+[/|\\].*)$/.exec(filename)
  if (sourceMatch && sourceMatch[1]) {
    return sourceMatch[1].replace(/\?$/, ``)
  }

  return filename
}

async function getNonGatsbyCodeFrame(stackTrace) {
  const callSite = stackTrace.find(CallSite => CallSite.getFileName())
  if (!callSite) {
    return null
  }

  const fileName = formatFilename(callSite.getFileName())
  const line = callSite.getLineNumber()
  const column = callSite.getColumnNumber()

  const test = await window.fetch(
    `/__original-stack-frame?fileName=` + window.encodeURIComponent(fileName)
  )

  console.log(test)

  return {
    fileName,
    line,
    column,
    // codeFrame: codeFrameColumns(
    //   code,
    //   {
    //     start: {
    //       line,
    //       column,
    //     },
    //   },
    //   {
    //     highlightCode: true,
    //   }
    // ),
  }
}

const RuntimeError = ({ problem, dismiss }) => {
  const [callSite, setCallSite] = React.useState({})

  const header = (
    <p data-gatsby-overlay="header__runtime-error">Unhandled Runtime Error</p>
  )
  const stacktrace = StackTrace.parse(problem.error)

  React.useEffect(() => {
    const result = getNonGatsbyCodeFrame(stacktrace)

    setCallSite(result)
  }, [])

  console.log(callSite)
  const body = <div>{problem.error.stack}</div>

  return <Overlay header={header} body={body} dismiss={dismiss} />
}

export default RuntimeError
