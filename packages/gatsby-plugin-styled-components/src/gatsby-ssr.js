import React from "react"
import { ServerStyleSheet, StyleSheetManager } from "styled-components"
import { renderToString } from "react-dom/server"

exports.replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const sheet = new ServerStyleSheet()

  const app = (
    <StyleSheetManager sheet={sheet.instance}>
      {bodyComponent}
    </StyleSheetManager>
  )

  const body = renderToString(app)

  replaceBodyHTMLString(body)
  setHeadComponents([sheet.getStyleElement()])

  return
}
