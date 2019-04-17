exports.onRouteUpdate = ({ location }, pluginOptions) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  var existingValue = domElem.getAttribute(`href`)
  var baseProtocol = domElem.getAttribute(`data-baseProtocol`)
  var baseHost = domElem.getAttribute(`data-baseHost`)
  if (existingValue && baseProtocol && baseHost) {
    var value = `${baseProtocol}//${baseHost}${location.pathname}`

    if (pluginOptions.search !== false) {
      value += location.search
    }

    value += location.hash

    domElem.setAttribute(`href`, `${value}${location.hash}`)
  }
}
