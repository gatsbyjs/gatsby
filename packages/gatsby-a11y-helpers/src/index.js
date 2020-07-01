import React from "react"

const Announce = props => (
  <div id="gatsby-route-announcement">{props.children}</div>
)

const RouteFocus = props => (
  <div id="gatsby-csr-focus-wrapper">{props.children}</div>
)

export { Announce, RouteFocus }
