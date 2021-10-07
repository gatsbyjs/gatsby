import * as React from "react"
import { Overlay, Header, HeaderOpenClose, Body } from "./overlay"
import { useFileCodeFrame } from "./hooks"
import { CodeFrame } from "./code-frame"
import { openInEditor } from "../utils"
import { Accordion, AccordionItem } from "./accordion"

const filePathRegex = /webpack:\/[^/]+\/(.*)$/

function WrappedAccordionItem({ error, open }) {
  console.log({ error })
  const stacktrace = error.stack
  const codeFrameInformation = stacktrace.find(CallSite => CallSite.fileName)
  const filePath = `./${filePathRegex.exec(codeFrameInformation?.fileName)[1]}`
  const lineNumber = codeFrameInformation?.lineNumber
  const columnNumber = codeFrameInformation?.columnNumber
  const name = codeFrameInformation?.functionName

  const res = useFileCodeFrame({ filePath, lineNumber, columnNumber })

  const Title = () => {
    if (!name) {
      return <>Unknown getServerData Error</>
    }

    return (
      <>
        Error in function{` `}
        <span data-font-weight="bold">{name}</span> in{` `}
        <span data-font-weight="bold">
          {filePath}:{lineNumber}
        </span>
      </>
    )
  }

  return (
    <AccordionItem open={open} title={<Title />}>
      <p data-gatsby-overlay="body__error-message">
        {error?.context?.sourceMessage}
      </p>
      <div data-gatsby-overlay="codeframe__top">
        <div>
          {filePath}:{lineNumber}
        </div>
        <button
          data-gatsby-overlay="body__open-in-editor"
          onClick={() => openInEditor(filePath, lineNumber)}
        >
          Open in Editor
        </button>
      </div>
      <CodeFrame decoded={res.decoded} />
    </AccordionItem>
  )
}

export function GetServerDataErrors({ errors, dismiss }) {
  const deduplicatedErrors = React.useMemo(
    () => Array.from(new Set(errors)),
    [errors]
  )
  const hasMultipleErrors = deduplicatedErrors.length > 1

  return (
    <Overlay>
      <Header data-gatsby-error-type="runtime-error">
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">
            {hasMultipleErrors
              ? `${errors.length} Unhandled getServerData Errors`
              : `Unhandled getServerData Error`}
          </h1>
        </div>
        <HeaderOpenClose dismiss={dismiss} />
      </Header>
      <Body>
        <p
          data-gatsby-overlay="body__describedby"
          id="gatsby-overlay-describedby"
        >
          {hasMultipleErrors ? `Multiple` : `One`} unhandled getServerData{` `}
          {hasMultipleErrors ? `errors` : `error`} found in your files. See the
          list below to fix {hasMultipleErrors ? `them` : `it`}:
        </p>
        <Accordion>
          {deduplicatedErrors.map((error, index) => (
            <WrappedAccordionItem
              open={index === 0}
              key={`${error.message}-${index}`}
              error={error}
            />
          ))}
        </Accordion>
      </Body>
    </Overlay>
  )
}
