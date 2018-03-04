import { navigateTo } from "gatsby-link"

import catchLinks from "./catch-links"

exports.onClientEntry = () => {
  catchLinks(window, href => {
    navigateTo(href)
  })
}
