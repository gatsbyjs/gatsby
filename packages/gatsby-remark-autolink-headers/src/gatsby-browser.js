let offsetY = 0

const getTargetOffset = hash => {
  const id = window.decodeURI(hash.replace(`#`, ``))
  if (id !== ``) {
    const element = document.getElementById(id)
    if (element) {
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop
      const clientTop =
        document.documentElement.clientTop || document.body.clientTop || 0
      const computedStyles = window.getComputedStyle(element)
      const scrollMarginTop =
        computedStyles.getPropertyValue(`scroll-margin-top`) ||
        computedStyles.getPropertyValue(`scroll-snap-margin-top`) ||
        `0px`

      return (
        element.getBoundingClientRect().top +
        scrollTop -
        parseInt(scrollMarginTop, 10) -
        clientTop -
        offsetY
      )
    }
  }
  return null
}

exports.onInitialClientRender = (_, pluginOptions) => {
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY
  }

  requestAnimationFrame(() => {
    const offset = getTargetOffset(window.location.hash)
    if (offset !== null) {
      window.scrollTo(0, offset)
    }
  })
}

exports.shouldUpdateScroll = ({ routerProps: { location } }) => {
  const offset = getTargetOffset(location.hash)
  return offset !== null ? [0, offset] : true
}
