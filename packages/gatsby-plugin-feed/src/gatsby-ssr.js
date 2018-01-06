import React from "react"
import { defaultOptions } from "./internals"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const links = options.feeds.map(({ output }, i) => {
    if (output.charAt(0) !== `/`) {
      output = `/` + output
    }

    return (
      <link
        key={`gatsby-plugin-feed-${i}`}
        rel="alternate"
        type="application/rss+xml"
        href={output}
      />
    )
  })

  setHeadComponents(links)
}
