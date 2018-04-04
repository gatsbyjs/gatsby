import React from "react"
import { withPrefix } from "gatsby-link"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const headComponents = [
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={withPrefix(`/manifest.json`)}
    />,
  ]

  if (!pluginOptions.avoid_meta) {
    headComponents.push(
      <meta
        key={`gatsby-plugin-manifest-meta`}
        name="theme-color"
        content={pluginOptions.theme_color}
      />
    )
  }

  setHeadComponents(headComponents)
}
