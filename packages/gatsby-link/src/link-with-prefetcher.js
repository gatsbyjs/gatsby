import * as React from "react"
import PropTypes from "prop-types"
import { useLocation } from "@gatsbyjs/reach-router"
import { GatsbyLink } from "./link"

function createIntersectionObserver(el, cb) {
  const io = new window.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (el === entry.target) {
        // Check if element is within viewport, remove listener, destroy observer, and run link callback.
        // MSEdge doesn't currently support isIntersecting, so also test for  an intersectionRatio > 0
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          io.unobserve(el)
          io.disconnect()
          cb()
        }
      }
    })
  })
  // Add element to the observer
  io.observe(el)
  return { instance: io, el }
}

export const GatsbyLinkWithPrefetcher = function GatsbyLinkWithPrefetcher({
  to,
  ...props
}) {
  const location = useLocation()
  console.log({ location: location.origin })

  if (
    to.startsWith(`http://`) ||
    to.startsWith(`https://`) ||
    to.startsWith(`//`)
  ) {
    if (process.env.NODE_ENV !== `production`) {
      console.warn(
        `External link ${to} was detected in a Link component. Use the Link component only for internal links. See: https://gatsby.dev/internal-links`
      )
    }

    return <a href={to} {...props} />
  }

  return <GatsbyLink to={to} {...props} />
}
