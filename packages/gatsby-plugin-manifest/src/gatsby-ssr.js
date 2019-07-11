import React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import fs from "fs"
import createContentDigest from "gatsby/dist/utils/create-content-digest"

import { defaultIcons, addDigestToPath } from "./common.js"

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix

let iconDigest = null

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  { localize, ...pluginOptions }
) => {
  if (Array.isArray(localize)) {
    const locales = pluginOptions.start_url
      ? localize.concat(pluginOptions)
      : localize
    const manifest = locales.find(locale =>
      RegExp(`^${locale.start_url}.*`, `i`).test(pathname)
    )
    pluginOptions = {
      ...pluginOptions,
      ...manifest,
    }
    if (!pluginOptions) return false
  }

  // We use this to build a final array to pass as the argument to setHeadComponents at the end of onRenderBody.
  let headComponents = []

  const srcIconExists = !!pluginOptions.icon

  const icons = pluginOptions.icons || defaultIcons
  const legacy =
    typeof pluginOptions.legacy !== `undefined` ? pluginOptions.legacy : true

  const cacheBusting =
    typeof pluginOptions.cache_busting_mode !== `undefined`
      ? pluginOptions.cache_busting_mode
      : `query`

  // If icons were generated, also add a favicon link.
  if (srcIconExists) {
    const favicon = icons && icons.length ? icons[0].src : null

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

  const suffix = pluginOptions.lang ? `_${pluginOptions.lang}` : ``

  // Add manifest link tag.
  headComponents.push(
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={withPrefix(`/manifest${suffix}.webmanifest`)}
      crossOrigin={pluginOptions.crossOrigin}
    />
  )

  // The user has an option to opt out of the theme_color meta tag being inserted into the head.
  if (pluginOptions.theme_color) {
    const insertMetaTag =
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
        href={withPrefix(
          addDigestToPath(
            icon.src,
            iconDigest,
            srcIconExists ? cacheBusting : `none`
          )
        )}
      />
    ))

    headComponents = [...headComponents, ...iconLinkTags]
  }

  setHeadComponents(headComponents)
  return true
}
