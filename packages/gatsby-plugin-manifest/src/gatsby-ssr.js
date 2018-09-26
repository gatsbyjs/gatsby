import React from "react"
import { withPrefix } from "gatsby"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  // If icons were generated, also add a favicon link.
  if (pluginOptions.icon) {
    let favicon = `/icons/icon-48x48.png`

    // The icon path could be different in hybrid mode
    // this takes the first one of the possible icons
    if (pluginOptions.icons && pluginOptions.icons.length) {
      favicon = pluginOptions.icons[0].src
    }

    setHeadComponents([
      <link
        key={`gatsby-plugin-manifest-icon-link`}
        rel="shortcut icon"
        href={withPrefix(favicon)}
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
