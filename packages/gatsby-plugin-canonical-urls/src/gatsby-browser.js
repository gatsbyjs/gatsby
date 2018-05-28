exports.onRouteUpdate = ({ location }) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  var existingValue = domElem.getAttribute(`href`)
  var baseProtocol = domElem.getAttribute(`data-baseProtocol`)
  var baseHost = domElem.getAttribute(`data-baseHost`)
  if (existingValue && baseProtocol && baseHost) {
    domElem.setAttribute(
      `href`,
      `${baseProtocol}//${baseHost}${location.pathname}${location.search}${
        location.hash
      }`
    )
  }
}
