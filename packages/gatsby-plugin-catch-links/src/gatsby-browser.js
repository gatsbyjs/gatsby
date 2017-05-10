import catchLinks from "./catch-links"

catchLinks(window, href => {
  console.log(href)
  window.___loadScriptsForPath(href, () => {
    window.___history.push(href)
  })
})
