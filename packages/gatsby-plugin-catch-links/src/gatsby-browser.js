import { navigateTo } from "gatsby-link"

import catchLinks from "./catch-links"

catchLinks(window, href => {
  navigateTo(href)
})
