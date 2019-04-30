import React from "react"
import { withPathPrefix, withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

// TODO: remove for v3
if (!withAssetPrefix) {
  withAssetPrefix = withPathPrefix
}

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { feeds } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const links = feeds.map(({ output, title }, i) => {
    if (output.charAt(0) !== `/`) {
      output = `/` + output
    }

    return (
      <link
        key={`gatsby-plugin-feed-${i}`}
        rel="alternate"
        type="application/rss+xml"
        title={title}
        href={withAssetPrefix(output)}
      />
    )
  })

  setHeadComponents(links)
}
