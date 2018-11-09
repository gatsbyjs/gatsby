import React from "react"
import { ServerStyleSheet, StyleSheetManager } from "styled-components"

const sheet = new ServerStyleSheet()

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapRootElement = ({ element }) => (
  <StyleSheetManager sheet={sheet.instance}>{element}</StyleSheetManager>
)

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([sheet.getStyleElement()])
}
