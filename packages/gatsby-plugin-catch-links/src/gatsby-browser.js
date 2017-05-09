import catchLinks from "./catch-links"
import createHistory from "history/createBrowserHistory"

const history = createHistory()
console.log(history)
window.gatsby_history = history

catchLinks(window, href => {
  console.log(href)
  // TODO figure out why this isn't working...
  history.push(href)
})
