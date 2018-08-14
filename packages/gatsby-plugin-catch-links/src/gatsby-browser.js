import { push } from "gatsby"

import catchLinks from "./catch-links"

exports.onClientEntry = () => {
  catchLinks(window, href => {
    push(href)
  })
}
