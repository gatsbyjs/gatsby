import { navigate } from "gatsby"

import catchLinks from "./catch-links"

exports.onClientEntry = (_, pluginOptions = {}) => {
  catchLinks(window, pluginOptions, href => {
    navigate(href)
  })
}
