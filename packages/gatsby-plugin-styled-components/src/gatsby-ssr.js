import React from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import { renderToString } from 'react-dom/server'

exports.replaceServerBodyRender = ({ component }) => {
  const sheet = new ServerStyleSheet()

  const app = (
    <StyleSheetManager sheet={sheet.instance}>
      {component}
    </StyleSheetManager>
  )

  const html = renderToString(app)
  const styles = sheet.getStyleElement()

  return { body: html, styles }
}
