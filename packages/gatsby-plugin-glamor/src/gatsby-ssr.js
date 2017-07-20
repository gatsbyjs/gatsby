import React from "react"
import { renderToString } from "react-dom/server"
const { renderStaticOptimized } = require("glamor/server")

exports.replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  let { html, css, ids } = renderStaticOptimized(() =>
    renderToString(bodyComponent)
  )

  replaceBodyHTMLString(html)

  setHeadComponents([
    <style id="glamor-styles" dangerouslySetInnerHTML={{ __html: css }} />,
    <script
      id="glamor-ids"
      dangerouslySetInnerHTML={{
        __html: `
        // <![CDATA[
        window._glamor = ${JSON.stringify(ids)}
        // ]]>
        `,
      }}
    />,
  ])
}
