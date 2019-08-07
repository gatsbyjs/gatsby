import React from "react"
import wrapRoot from "./wrap-root-element"

export const onRenderBody = ({ setHeadComponents }) => {
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

export const wrapRootElement = wrapRoot
