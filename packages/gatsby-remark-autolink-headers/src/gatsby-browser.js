let offsetY = 0

const getTargetOffset = hash => {
  const id = window.decodeURI(hash.replace(`#`, ``))
  if (id !== ``) {
    const element = document.getElementById(id)
    if (element) {
      let scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop
      let clientTop =
        document.documentElement.clientTop || document.body.clientTop || 0
      return (
        element.getBoundingClientRect().top + scrollTop - clientTop - offsetY
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
