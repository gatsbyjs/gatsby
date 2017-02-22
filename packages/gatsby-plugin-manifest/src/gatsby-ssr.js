const React = require("react")

exports.modifyHeadComponents = (args, pluginOptions) => [
  <link rel="manifest" href="/manifest.json" />,
  <meta name="theme-color" content={pluginOptions.theme_color} />,
]
