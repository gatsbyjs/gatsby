import url from "url"

exports.onRouteUpdate = (
  { location },
  pluginOptions = { stripQueryString: false }
) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  const existingValue = domElem.getAttribute(`href`)
  if (existingValue) {
    const parsed = url.parse(existingValue)
    let value = `${parsed.protocol}//${parsed.host}${location.pathname}`

    const { stripQueryString } = pluginOptions

    if (!stripQueryString) {
      value += location.search
    }

    value += location.hash

    domElem.setAttribute(`href`, `${value}`)
  }
}
