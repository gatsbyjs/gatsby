import React from "react"
import { defaultIcons } from "./common.js"

const normalize = s => `/${s.replace(/^\/+/g, "")}`

exports.generateHeadComponents = function*(withPrefix, pluginOptions) {
  const manifest = { ...pluginOptions }

  // If icons are not manually defined, use the default icon set.
  if (!manifest.icons) {
    manifest.icons = defaultIcons
  }

  // If icons were generated, also add a favicon link and apple-touch-icons.
  if (pluginOptions.icon) {
    if (manifest.icons && manifest.icons.length) {
      yield (
        <link
          key={`gatsby-plugin-manifest-icon-link`}
          rel="shortcut icon"
          href={withPrefix(`${normalize(manifest.icons[0].src)}`)}
        />
      )
    }
    for (const icon of manifest.icons) {
      yield (
        <link
          key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
          rel="apple-touch-icon"
          sizes={icon.sizes}
          href={withPrefix(`${normalize(icon.src)}`)}
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
