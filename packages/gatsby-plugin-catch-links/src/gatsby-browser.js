import { navigate } from "gatsby"

import catchLinks from "./catch-links"

export const onClientEntry = (_, pluginOptions = {}) => {
  catchLinks(window, pluginOptions, href => {
    navigate(href)
  })
}
