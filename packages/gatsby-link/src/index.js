import React from "react"
import { Link } from "@reach/router"
import LinkContainer, { navigate, withPrefix, propTypes } from "./LinkContainer"

const push = to => {
  console.warn(
    `The "push" method is now deprecated and will be removed in Gatsby v3. Please use "navigate" instead.`
  )
  window.___push(to)
}

const replace = to => {
  console.warn(
    `The "replace" method is now deprecated and will be removed in Gatsby v3. Please use "navigate" instead.`
  )
  window.___replace(to)
}

// TODO: Remove navigateTo for Gatsby v3
const navigateTo = to => {
  console.warn(
    `The "navigateTo" method is now deprecated and will be removed in Gatsby v3. Please use "push" instead.`
  )
  return push(to)
}

const GatsbyLink = React.forwardRef(function GatsbyLink(props, ref) {
  return (
    <LinkContainer {...props}>
      {linkProps => <Link {...linkProps}>{props.children}</Link>}
    </LinkContainer>
  )
})

GatsbyLink.propTypes = propTypes

export default GatsbyLink

export { withPrefix, LinkContainer, navigate, push, replace, navigateTo }
