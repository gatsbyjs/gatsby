exports.onRouteUpdate = ({ location }, pluginOptions) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  domElem.setAttribute(
    `href`,
    `${pluginOptions.siteUrl || window.location.origin}${location.pathname}`
  )
}
