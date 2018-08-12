import React from "react"
import { defaultIcons, doesIconExist } from "./common.js"

exports.generateHeadComponents = function*(withPrefix, pluginOptions) {
  const manifest = { ...pluginOptions }

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = defaultIcons
  }

  // If icons were generated, also add a favicon link and apple-touch-icons.
  if (pluginOptions.icon) {
    yield (
      <link
        key={`gatsby-plugin-manifest-icon-link`}
        rel="shortcut icon"
        href={withPrefix(`/icons/icon-48x48.png`)}
      />
    )
    for (const icon of manifest.icons) {
      yield (
        <link
          key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
          rel="apple-touch-icon"
          sizes={icon.sizes}
          href={withPrefix(`/icons/icon-${icon.sizes}.png`)}
        />
      )
    }
    yield (
      <link
        key={`gatsby-plugin-manifest-link`}
        rel="manifest"
        href={withPrefix(`/manifest.webmanifest`)}
      />
    )
    yield (
      <meta
        key={`gatsby-plugin-manifest-meta`}
        name="theme-color"
        content={pluginOptions.theme_color}
      />
    )
  }
}
