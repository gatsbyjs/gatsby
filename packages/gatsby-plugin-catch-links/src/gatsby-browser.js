import catchLinks from "catch-links"
import browserHistory from "react-router/lib/browserHistory"

catchLinks(window, href => {
  console.log(href)
  browserHistory.push(href)
})
