import React from "react"
import { withPrefix } from "gatsby"
import { defaultIcons } from "./common.js"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const icons = pluginOptions.icons || defaultIcons

  // If icons were generated, also add a favicon link.
  if (pluginOptions.icon) {
    let favicon = icons && icons.length ? icons[0].src : null

    if (favicon) {
      setHeadComponents([
        <link
          key={`gatsby-plugin-manifest-icon-link`}
          rel="shortcut icon"
          href={withPrefix(favicon)}
        />,
      ])
    }
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

  if (pluginOptions.legacy) {
    setHeadComponents(
      icons.map(icon => (
        <link
          key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
          rel="apple-touch-icon"
          sizes={icon.sizes}
          href={withPrefix(`${icon.src}`)}
        />
      ))
    )
  }
}
