import * as React from "react"
import { prettifyStack } from "../utils"

export function useStackFrame({ moduleId, lineNumber, columnNumber }) {
  const url =
    `/__original-stack-frame?moduleId=` +
    window.encodeURIComponent(moduleId) +
    `&lineNumber=` +
    window.encodeURIComponent(lineNumber) +
    `&columnNumber=` +
    window.encodeURIComponent(columnNumber)

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
