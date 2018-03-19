import React from "react"
import { withPrefix } from "gatsby-link"
import { defaultOptions } from "./internals"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let { output, addLinkToHead } = { ...defaultOptions, ...pluginOptions }

  if (!addLinkToHead) {
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
