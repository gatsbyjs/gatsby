const React = require(`react`)
const wrapRoot = require(`./wrap-root-element`)

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      rel="dns-prefetch"
      key="dns-prefetch-jsdelivr"
      href="https://cdn.jsdelivr.net"
    />,
    <link
      rel="dns-prefetch"
      key="dns-prefetch-google-analytics"
      href="https://www.google-analytics.com"
    />,
  ])
}

exports.wrapRootElement = wrapRoot
