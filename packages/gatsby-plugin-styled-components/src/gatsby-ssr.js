import React from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import { renderToString } from 'react-dom/server'

exports.replaceServerBodyRender = ({ component, headComponents }) => {
  const sheet = new ServerStyleSheet()

  const app = (
    <StyleSheetManager sheet={sheet.instance}>
      {component}
    </StyleSheetManager>
  )

  const body = renderToString(app)
  const headComponents = sheet.getStyleElement()

  return { body, headComponents }
}
