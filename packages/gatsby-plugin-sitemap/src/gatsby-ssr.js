import React from "react"
import { withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let { output, createLinkInHead } = { ...defaultOptions, ...pluginOptions }

  if (!createLinkInHead) {
    return
  }

  if (output.charAt(0) !== `/`) {
    output = `/` + output
  }

  setHeadComponents([
    <link
      key={`gatsby-plugin-sitemap`}
      rel="sitemap"
      type="application/xml"
      href={withAssetPrefix(output)}
    />,
  ])
}
