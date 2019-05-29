exports.onRouteUpdate = ({ location }) => {
  // wrap inside a timeout to ensure the title has properly been changed
  setTimeout(() => {
    window.dataLayer.push({ event: `gatsby-route-change` })
  }, 50)
}
