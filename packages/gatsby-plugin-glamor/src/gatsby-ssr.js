import React from "react"
import { renderToString } from "react-dom/server"
import { renderStaticOptimized } from "glamor/server"

exports.replaceServerBodyRender = ({ component, headComponents }) => {
  const { html, css, ids } = renderStaticOptimized(() =>
    renderToString(component))

  headComponents.push(
    <style id="glamor-styles" dangerouslySetInnerHTML={{ __html: css }} />,
  )

  headComponents.push(
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
  )

  return { headComponents, body: html }
}
