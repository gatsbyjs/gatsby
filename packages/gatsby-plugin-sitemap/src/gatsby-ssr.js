import React from "react"
import { defaultOptions } from "./internals"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let { output } = { ...defaultOptions, ...pluginOptions }
  if (output.charAt(0) !== `/`) {
    output = `/` + output
  }

  setHeadComponents([
    <link
      key={`gatsby-plugin-sitemap`}
      rel="sitemap"
      type="application/xml"
      href={output}
    />,
  ])
}
