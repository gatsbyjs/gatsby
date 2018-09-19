import React from "react"
import { withPrefix } from "gatsby"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  // If icons were generated, also add a favicon link.
  if (pluginOptions.icon) {
    let iconPath = '/icons';

    // The icon path could be different in hybrid mode
    if (pluginOptions.icons && pluginOptions.icons.length) {
      iconPath = pluginOptions.icons[0].src.substring(0, pluginOptions.icons[0].src.lastIndexOf("/"))
    }

    setHeadComponents([
      <link
        key={`gatsby-plugin-manifest-icon-link`}
        rel="shortcut icon"
        href={withPrefix(`${iconPath}/icon-48x48.png`)}
      />,
    ])
  }
  setHeadComponents([
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={withPrefix(`/manifest.webmanifest`)}
    />,
    <meta
      key={`gatsby-plugin-manifest-meta`}
      name="theme-color"
      content={pluginOptions.theme_color}
    />,
  ])
}
