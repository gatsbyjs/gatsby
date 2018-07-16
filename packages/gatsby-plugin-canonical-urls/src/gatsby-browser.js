exports.onRouteUpdate = ({ location }) => {
  const domElem = document.querySelector(`link[rel='canonical']`)
  const existingValue = domElem.getAttribute(`href`)
  const baseProtocol = domElem.getAttribute(`data-baseProtocol`)
  const baseHost = domElem.getAttribute(`data-baseHost`)
  let pathname = location.pathname
  if(domElem.getAttribute(`data-requireTrailingSlash`) === `true`) {
    pathname = pathname.replace(/\/$|$/, `/`)
  }
  if (existingValue && baseProtocol && baseHost) {
    domElem.setAttribute(
      `href`,
      `${baseProtocol}//${baseHost}${pathname}${location.search}${
        location.hash
      }`
    )
  }
}
