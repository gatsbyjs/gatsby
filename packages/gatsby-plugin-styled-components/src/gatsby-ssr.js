import React from "react"
import { ServerStyleSheet, StyleSheetManager } from "styled-components"

const sheetByPathname = {}

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapRootElement = ({ element, pathname }) => {
  const sheet = (sheetByPathname[pathname] = new ServerStyleSheet())
  return <StyleSheetManager sheet={sheet.instance}>{element}</StyleSheetManager>
}

exports.onRenderBody = ({ setHeadComponents, pathname }) => {
  if (!sheetByPathname[pathname]) {
    sheetByPathname[pathname] = new ServerStyleSheet()
  }

  setHeadComponents([sheetByPathname[pathname].getStyleElement()])
}
