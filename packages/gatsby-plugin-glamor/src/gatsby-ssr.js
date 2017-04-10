import React from "react"
import { renderToString } from "react-dom/server"
import inline from "glamor-inline"

exports.replaceServerBodyRender = ({ component }) => {
  const html = renderToString(component)
  const inlinedHtml = inline(html)

  return { body: inlinedHtml }
}
