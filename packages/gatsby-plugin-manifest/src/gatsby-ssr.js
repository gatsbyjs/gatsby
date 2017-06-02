import React from "react"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  setHeadComponents([
    <link rel="manifest" href="/manifest.json" />,
    <meta name="theme-color" content={pluginOptions.theme_color} />,
  ])
}
