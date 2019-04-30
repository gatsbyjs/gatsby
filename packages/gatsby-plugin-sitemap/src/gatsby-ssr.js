import React from "react"
import { withPathPrefix, withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

// TODO: remove for v3
let withPrefix = withAssetPrefix
if (!withPrefix) {
  withPrefix = withPathPrefix
}

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
      href={withPrefix(output)}
    />,
  ])
}
