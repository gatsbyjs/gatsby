import React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix

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
