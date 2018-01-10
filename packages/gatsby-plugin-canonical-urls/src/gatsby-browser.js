exports.onRouteUpdate = ({ location }) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  domElem.setAttribute(`href`, `${window.location.origin}${location.pathname}`)
}
