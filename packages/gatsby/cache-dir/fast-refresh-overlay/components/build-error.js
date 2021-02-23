import * as React from "react"
import Anser from "anser"
import { Overlay, Header, Body, Footer } from "./overlay"
import { CodeFrame } from "./code-frame"
import { prettifyStack, getLineNumber, openInEditor } from "../utils"

export function BuildError({ error }) {
  const noop = React.useCallback(() => {}, [])
  const [file, cause, , ...rest] = error.split(`\n`)

  const lineNumber = getLineNumber(cause)
  const decoded = prettifyStack(rest)

  return (
    <Overlay>
      <Header open={openInEditor(file, lineNumber)} dismiss={noop}>
        <div data-gatsby-overlay="header__cause-file">
          <p>{cause}</p>
          <span>{file}</span>
        </div>
      </Header>
      <Body>
        <CodeFrame decoded={decoded} />
      </Body>
      <Footer>
        This error occurred during the build process and can only be dismissed
        by fixing the error.
      </Footer>
    </Overlay>
  )
}
