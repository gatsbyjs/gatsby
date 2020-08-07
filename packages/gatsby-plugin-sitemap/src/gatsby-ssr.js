import * as React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { validateOptionsSsr, withoutTrailingSlash } from "./internals"

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  let { output, createLinkInHead } = validateOptionsSsr(pluginOptions)

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
      href={withPrefix(withoutTrailingSlash(output) + `/sitemap-index.xml.gz`)}
    />,
  ])
}
