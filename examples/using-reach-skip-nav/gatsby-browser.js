export const onRouteUpdate = ({ location, prevLocation }) => {
  if (prevLocation !== null) {
    const skipLink = document.querySelector("[data-reach-skip-link]")
    if (skipLink) {
      skipLink.focus()
    }
  }
}
