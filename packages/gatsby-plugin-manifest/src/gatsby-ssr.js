import React from "react"
import { withPrefix } from "gatsby-link"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {

  const { icons } = pluginOptions
  const iconPath = icons[0].src.substring(0, icons[0].src.lastIndexOf(`/`))

  setHeadComponents([
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={withPrefix(`${iconPath}/manifest.json`)}
    />,
    <meta
      key={`gatsby-plugin-manifest-meta`}
      name="theme-color"
      content={pluginOptions.theme_color}
    />,
  ])
}
