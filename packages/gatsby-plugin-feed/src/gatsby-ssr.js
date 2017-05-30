import React from 'react'
import { defaultOptions } from './internals'

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { feeds } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const feeds = options.feeds.map(({ output }) => {
    if (output.charAt(0) !== '/') {
      output = '/' + output
    }

    return (
      <link
        rel="alternate"
        type="application/rss+xml"
        href={output}
      />
    )
  })

  setHeadComponents(feeds)
}

