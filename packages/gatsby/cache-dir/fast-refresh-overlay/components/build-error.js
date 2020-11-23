import React from "react"
import Overlay from "./overlay"
import Anser from "anser"
import CodeFrame from "./code-frame"
import { prettifyStack } from "../utils"

const BuildError = ({ error, open, dismiss }) => {
  const [file, cause, _emptyLine, ...rest] = error.split(`\n`)
  const [_fullPath, _detailedError] = rest
  const detailedError = Anser.ansiToJson(_detailedError, {
    remove_empty: true,
    json: true,
  })
  const lineNumberRegex = /^[0-9]*:[0-9]*$/g
  const lineNumberFiltered = detailedError.filter(
    d => d.content !== ` ` && d.content.match(lineNumberRegex)
  )[0]?.content
  const lineNumber = lineNumberFiltered.substr(
    0,
    lineNumberFiltered.indexOf(`:`)
  )
  const decoded = prettifyStack(rest)

  const header = (
    <>
      <div data-gatsby-overlay="header__cause-file">
        <p>{cause}</p>
        <span>{file}</span>
      </div>
      <button
        onClick={() => open(file, lineNumber)}
        data-gatsby-overlay="header__open-in-editor"
      >
        Open in editor
      </button>
    </>
  )

  const body = <CodeFrame decoded={decoded} />

  return <Overlay header={header} body={body} dismiss={dismiss} />
}

export default BuildError
