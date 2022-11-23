import * as React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { defaultIcons, addDigestToPath, favicons } from "./common.js"
import getManifestForPathname from "./get-manifest-pathname"

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRenderBody = (
  { setHeadComponents, pathname = `/` },
  {
    localize,
    legacy,
    cache_busting_mode: cacheBusting,
    cacheDigest,
    icon,
    icons: pluginIcons,
    include_favicon: insertFaviconLinkTag,
    theme_color_in_head: insertMetaTag,
    theme_color: themeColor,
    crossOrigin = `anonymous`,
  }
) => {
  // We use this to build a final array to pass as the argument to setHeadComponents at the end of onRenderBody.
  const headComponents = []

  const srcIconExists = !!icon
  const icons = pluginIcons || defaultIcons
  const manifestFileName = getManifestForPathname(pathname, localize)

  // If icons were generated, also add a favicon link.
  if (srcIconExists) {
    if (insertFaviconLinkTag) {
      favicons.forEach(favicon => {
        headComponents.push(
          <link
            key={`gatsby-plugin-manifest-icon-link-png`}
            rel="icon"
            href={withPrefix(
              addDigestToPath(favicon.src, cacheDigest, cacheBusting)
            )}
            type="image/png"
          />
        )
      })
      if (icon?.endsWith(`.svg`)) {
        headComponents.push(
          <link
            key={`gatsby-plugin-manifest-icon-link-svg`}
            rel="icon"
            href={withPrefix(
              addDigestToPath(`favicon.svg`, cacheDigest, cacheBusting)
            )}
            type="image/svg+xml"
          />
        )
      }
    }
  }

  // Add manifest link tag.
  headComponents.push(
    <link
      key={`gatsby-plugin-manifest-link`}
      rel="manifest"
      href={fallbackWithPrefix(`/${manifestFileName}`)}
      crossOrigin={crossOrigin}
    />
  )

  // The user has an option to opt out of the theme_color meta tag being inserted into the head.
  if (themeColor && insertMetaTag) {
    headComponents.push(
      <meta
        key={`gatsby-plugin-manifest-meta`}
        name="theme-color"
        content={themeColor}
      />
    )
  }

  if (legacy) {
    icons.forEach(icon => {
      headComponents.push(
        <link
          key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
          rel="apple-touch-icon"
          sizes={icon.sizes}
          href={withPrefix(
            addDigestToPath(
              icon.src,
              cacheDigest,
              srcIconExists ? cacheBusting : `none`
            )
          )}
        />
      )
    })
  }

  setHeadComponents(headComponents)

  return true
}
