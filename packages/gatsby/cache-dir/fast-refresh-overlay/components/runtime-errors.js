import * as React from "react"
import StackTrace from "stack-trace"
import { Overlay, Header, Body, Footer } from "./overlay"
import { useStackFrame } from "./hooks"
import { CodeFrame } from "./code-frame"
import { getCodeFrameInformation, openInEditor } from "../utils"

export function RuntimeErrors({ errors, dismiss }) {
  const stacktrace = StackTrace.parse(errors[0])
  const {
    moduleId,
    lineNumber,
    columnNumber,
    functionName,
  } = getCodeFrameInformation(stacktrace)

  const res = useStackFrame({ moduleId, lineNumber, columnNumber })

  return (
    <Overlay>
      <Header
        open={openInEditor(moduleId, res.sourcePosition.line)}
        dismiss={dismiss}
      >
        <div data-gatsby-overlay="header__cause-file">
          <p>Unhandled Runtime Error</p>
          <span>{moduleId}</span>
        </div>
      </Header>
      <Body>
        <p data-gatsby-overlay="body__error-message-header">
          Error in function <span data-font-weight="bold">{functionName}</span>
        </p>
        <p data-gatsby-overlay="body__error-message">{errors[0].message}</p>
        <CodeFrame decoded={res.decoded} />
      </Body>
      <Footer>some footer goes here</Footer>
    </Overlay>
  )
}
