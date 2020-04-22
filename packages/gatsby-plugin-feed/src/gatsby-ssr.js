import React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix

exports.onRenderBody = ({ setHeadComponents, pathname }, pluginOptions) => {
  const { feeds } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const links = feeds
    .filter(({ match }) => {
      if (typeof match === `string`) return new RegExp(match).exec(pathname)
      return true
    })
    .map(({ output, title, link }, i) => {
      const href = link || withPrefix(output.replace(/^\/?/, `/`))

      return (
        <link
          key={`gatsby-plugin-feed-${i}`}
          rel="alternate"
          type="application/rss+xml"
          title={title}
          href={href}
        />
      )
    })

  setHeadComponents(links)
}
