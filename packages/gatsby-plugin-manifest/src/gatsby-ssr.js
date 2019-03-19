import React from "react"
import { withPrefix } from "gatsby"
import { defaultIcons, createContentDigest, addDigestToPath } from "./common.js"
import fs from "fs"

let iconDigest = null

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  // We use this to build a final array to pass as the argument to setHeadComponents at the end of onRenderBody.
  let headComponents = []

  const icons = pluginOptions.icons || defaultIcons
  const legacy =
    typeof pluginOptions.legacy !== `undefined` ? pluginOptions.legacy : true

  const cacheBusting =
    typeof pluginOptions.cache_busting_mode !== `undefined`
      ? pluginOptions.cache_busting_mode
      : `query`

  // If icons were generated, also add a favicon link.
  if (pluginOptions.icon) {
    let favicon = icons && icons.length ? icons[0].src : null

    if (cacheBusting !== `none`) {
      iconDigest = createContentDigest(fs.readFileSync(pluginOptions.icon))
    }

    const insertFaviconLinkTag =
      typeof pluginOptions.include_favicon !== `undefined`
        ? pluginOptions.include_favicon
        : true

    if (favicon && insertFaviconLinkTag) {
      headComponents.push(
        <link
          key={`gatsby-plugin-manifest-icon-link`}
          rel="shortcut icon"
          href={withPrefix(addDigestToPath(favicon, iconDigest, cacheBusting))}
        />
      )
    }
  }

  // Add manifest link tag.
  headComponents.push(
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={withPrefix(`/manifest.webmanifest`)}
      crossOrigin={pluginOptions.crossOrigin}
    />
  )

  // The user has an option to opt out of the theme_color meta tag being inserted into the head.
  if (pluginOptions.theme_color) {
    let insertMetaTag =
      typeof pluginOptions.theme_color_in_head !== `undefined`
        ? pluginOptions.theme_color_in_head
        : true

    if (insertMetaTag) {
      headComponents.push(
        <meta
          key={`gatsby-plugin-manifest-meta`}
          name="theme-color"
          content={pluginOptions.theme_color}
        />
      )
    }
  }

  if (legacy) {
    const iconLinkTags = icons.map(icon => (
      <link
        key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
        rel="apple-touch-icon"
        sizes={icon.sizes}
        href={withPrefix(addDigestToPath(icon.src, iconDigest, cacheBusting))}
      />
    ))

    headComponents = [...headComponents, ...iconLinkTags]
  }

  setHeadComponents(headComponents)
}
