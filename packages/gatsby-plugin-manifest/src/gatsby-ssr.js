import React from "react"
import { withPrefix } from "gatsby"
import { defaultIcons } from "./common.js"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  // We use this to build a final array to pass as the argument to setHeadComponents at the end of onRenderBody.
  let headComponents = []

  const icons = pluginOptions.icons || defaultIcons
  const legacy =
    typeof pluginOptions.legacy !== `undefined` ? pluginOptions.legacy : true

  // The user has an option to opt out of the favicon link tag being inserted into the head.
  if (pluginOptions.icon) {
    let favicon = icons && icons.length ? icons[0].src : null

    const insertFaviconLinkTag =
      typeof pluginOptions.include_favicon !== `undefined`
        ? pluginOptions.include_favicon
        : true

    if (favicon && insertFaviconLinkTag) {
      headComponents.push(
        <link
          key={`gatsby-plugin-manifest-icon-link`}
          rel="shortcut icon"
          href={withPrefix(favicon)}
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
    let insertMetaTag = Object.keys(pluginOptions).includes(
      `theme_color_in_head`
    )
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
        href={withPrefix(`${icon.src}`)}
      />
    ))

    headComponents = [...headComponents, ...iconLinkTags]
  }

  setHeadComponents(headComponents)
}
