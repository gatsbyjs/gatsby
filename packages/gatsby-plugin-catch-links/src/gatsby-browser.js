import { navigate } from "gatsby"

import catchLinks from "./catch-links"

exports.onClientEntry = () => {
  catchLinks(window, href => {
    navigate(href)
  })
}
