import * as React from "react"
import { prettifyStack } from "../utils"

const initialResponse = {
  decoded: null,
  sourcePosition: {
    line: null,
    number: null,
  },
  sourceContent: null,
}

export function useStackFrame({ moduleId, lineNumber, columnNumber }) {
  const url =
    `/__original-stack-frame?moduleId=` +
    window.encodeURIComponent(moduleId) +
    `&lineNumber=` +
    window.encodeURIComponent(lineNumber) +
    `&columnNumber=` +
    window.encodeURIComponent(columnNumber)

  const [response, setResponse] = React.useState(initialResponse)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(url)
        const json = await res.json()
        const decoded = prettifyStack(json.codeFrame)
        const { sourcePosition, sourceContent } = json
        setResponse({
          decoded,
          sourceContent,
          sourcePosition,
        })
      } catch (err) {
        setResponse({
          ...initialResponse,
          decoded: prettifyStack(err.message),
        })
      }
    }
    fetchData()
  }, [])

  return response
}
