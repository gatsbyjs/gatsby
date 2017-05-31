import React from "react"

exports.createHeadComponents = (args, pluginOptions) => [
  <link rel="manifest" href="/manifest.json" />,
  <meta name="theme-color" content={pluginOptions.theme_color} />,
]
