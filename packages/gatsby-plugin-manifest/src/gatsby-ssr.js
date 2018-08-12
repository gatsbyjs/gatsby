import React from "react"
import { withPrefix } from "gatsby"
import { defaultIcons, doesIconExist } from "./common.js"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const manifest = { ...pluginOptions }

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = defaultIcons
  }

  // If icons were generated, also add a favicon link and apple-touch-icons.
  if (pluginOptions.icon) {
    setHeadComponents([
      <link
        key={`gatsby-plugin-manifest-icon-link`}
        rel="shortcut icon"
        href={withPrefix(`/icons/icon-48x48.png`)}
      />,
    ])
    setHeadComponents(manifest.icons.map(icon => (
      <link
        key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
        rel="apple-touch-icon"
        sizes={icon.sizes}
        href={withPrefix(`/icons/icon-${icon.sizes}.png`)}
      />
    )))
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
