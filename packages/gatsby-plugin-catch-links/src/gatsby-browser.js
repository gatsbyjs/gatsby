import { push } from "gatsby-link"

import catchLinks from "./catch-links"

exports.onClientEntry = () => {
  catchLinks(window, href => {
    push(href)
  })
}
