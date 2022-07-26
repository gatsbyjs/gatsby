import * as React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { posix } from "path"

// TODO: Remove for v3 - Fix janky path/asset prefixing
const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { output, createLinkInHead } = pluginOptions

  if (!createLinkInHead) {
    return
  }

  setHeadComponents([
    <link
      key={`gatsby-plugin-sitemap`}
      rel="sitemap"
      type="application/xml"
      href={withPrefix(posix.join(output, `/sitemap-index.xml`))}
    />,
  ])
}
