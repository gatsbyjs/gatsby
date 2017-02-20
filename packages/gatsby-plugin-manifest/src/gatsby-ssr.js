const React = require(`react`)

exports.modifyHeadComponents = ({ pluginOptions }) => [
  <link rel="manifest" href="/manifest.json" />,
  <meta name="theme-color" content={pluginOptions.theme_color} />,
]
