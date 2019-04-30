import React from "react"
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from "gatsby"
import { defaultOptions } from "./internals"

// TODO: remove for v3
let withPrefix = withAssetPrefix
if (!withPrefix) {
  withPrefix = fallbackWithPrefix
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
        href={withPrefix(output)}
      />
    )
  })

  setHeadComponents(links)
}
