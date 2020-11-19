import React from "react"
import Overlay from "./overlay"
import Anser from "anser"

function prettifyStack(errorInformation) {
  const txt = errorInformation.join(`\n`)
  return Anser.ansiToJson(txt, {
    remove_empty: true,
    use_classes: true,
    json: true,
  })
}

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

  const body = (
    <pre data-gatsby-overlay="pre">
      <code data-gatsby-overlay="pre__code">
        {decoded.map((entry, index) => (
          <span
            key={`frame-${index}`}
            data-gatsby-overlay="pre__code__span"
            style={{
              color: entry.fg ? `var(--color-${entry.fg})` : undefined,
              ...(entry.decoration === `bold`
                ? { fontWeight: 800 }
                : entry.decoration === `italic`
                ? { fontStyle: `italic` }
                : undefined),
            }}
          >
            {entry.content}
          </span>
        ))}
      </code>
    </pre>
  )

  return <Overlay header={header} body={body} dismiss={dismiss} />
}

export default BuildError
