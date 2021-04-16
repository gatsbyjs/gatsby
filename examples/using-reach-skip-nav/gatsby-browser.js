// hook into Gatsby's onRouteUpdate API https://www.gatsbyjs.com/docs/browser-apis/#onRouteUpdate
export const onRouteUpdate = ({ location, prevLocation }) => {
  if (prevLocation !== null) { //there has been a page change
    const skipLink = document.querySelector("[data-reach-skip-link]") //grab the skip link from the selector provided on the <SkipNavLink />
    if (skipLink) { //if it exists, focus it
      skipLink.focus()
    }
  }
}
