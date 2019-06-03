import React from "react"
import wrapRoot from "./wrap-root-element"

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
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

  const attachCode = `
  if (ga) {
    ga('require', 'linker');
    ga('linker:autoLink', ['gatsbyjs.com']);
  }`

  // use with the `allowLinker` option of gatsby-plugin-google-analytics
  setPostBodyComponents([
    <script
      key="ga-linker"
      dangerouslySetInnerHTML={{
        __html: attachCode,
      }}
    />,
  ])
}

export const wrapRootElement = wrapRoot
