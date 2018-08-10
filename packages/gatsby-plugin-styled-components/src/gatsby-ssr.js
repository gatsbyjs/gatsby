import React from "react"
import { ServerStyleSheet, StyleSheetManager } from "styled-components"

const sheet = new ServerStyleSheet()

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapRootComponent = ({ component }) => (
  <StyleSheetManager sheet={sheet.instance}>{component}</StyleSheetManager>
)

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([sheet.getStyleElement()])
}
