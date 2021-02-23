import * as React from "react"
import StackTrace from "stack-trace"
import { Overlay, Header, HeaderOpenClose, Body } from "./overlay"
import { useStackFrame } from "./hooks"
import { CodeFrame } from "./code-frame"
import { getCodeFrameInformation, openInEditor } from "../utils"
import { Accordion, AccordionItem } from "./accordion"

/*
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">Unhandled Runtime Error</h1>
          <span>{moduleId}</span>
        </div>
 */

export function RuntimeErrors({ errors, dismiss }) {
  console.log({ runtimeerrors: errors })

  const stacktrace = StackTrace.parse(errors[0])
  const hasMultipleErrors = errors.length > 1
  const {
    moduleId,
    lineNumber,
    columnNumber,
    functionName,
  } = getCodeFrameInformation(stacktrace)

  const res = useStackFrame({ moduleId, lineNumber, columnNumber })

  return (
    <Overlay>
      <Header data-gatsby-error-type="runtime-error">
        <div data-gatsby-overlay="header__cause-file">
          <h1 id="gatsby-overlay-labelledby">
            {hasMultipleErrors
              ? `${errors.length} Unhandled Runtime Errors`
              : `Unhandled Runtime Error`}
          </h1>
        </div>
        <HeaderOpenClose
          open={() => openInEditor(moduleId, res.sourcePosition?.line)}
          dismiss={dismiss}
        />
      </Header>
      <Body>
        <p
          data-gatsby-overlay="body__describedby"
          id="gatsby-overlay-describedby"
        >
          {hasMultipleErrors ? `Multiple` : `One`} unhandled runtime{` `}
          {hasMultipleErrors ? `errors` : `error`} found in your files. See the
          list below to fix {hasMultipleErrors ? `them` : `it`}:
        </p>
        <Accordion>
          <AccordionItem
            open
            title={
              <>
                Error in function{` `}
                <span data-font-weight="bold">{functionName}</span> in{` `}
                <span data-font-weight="bold">{moduleId}</span>
              </>
            }
          >
            <p data-gatsby-overlay="body__error-message">{errors[0].message}</p>
            <CodeFrame decoded={res.decoded} />
          </AccordionItem>
        </Accordion>
      </Body>
    </Overlay>
  )
}
