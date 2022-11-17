import React from "react"

export { wrapPageElement } from "./gatsby-shared"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`)
    return null

  const pluginConfig = pluginOptions.pluginConfig || {}

  const origin = pluginConfig.origin || `https://www.googletagmanager.com`

  // Lighthouse recommends pre-connecting to google tag manager
  return setHeadComponents([
    <link rel="preconnect" key="preconnect-google-gtag" href={origin} />,
    <link rel="dns-prefetch" key="dns-prefetch-google-gtag" href={origin} />,
  ])
}
