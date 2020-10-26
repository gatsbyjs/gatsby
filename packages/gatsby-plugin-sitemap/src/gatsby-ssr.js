import * as React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { withoutTrailingSlash } from "./internals"
import { validateOptionsSsr } from "./options-validation"

// TODO: Remove for v3 - Fix janky path/asset prefixing
const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  //TODO: This handles if the `pluginOptionsSchema` API was used, can be removed once the API is on by default.
  const { output, createLinkInHead } = pluginOptions?.output
    ? pluginOptions
    : validateOptionsSsr(pluginOptions)

  if (!createLinkInHead) {
    return
  }

  setHeadComponents([
    <link
      key={`gatsby-plugin-sitemap`}
      rel="sitemap"
      type="application/xml"
      href={withPrefix(withoutTrailingSlash(output) + `/sitemap-index.xml`)}
    />,
  ])
}
