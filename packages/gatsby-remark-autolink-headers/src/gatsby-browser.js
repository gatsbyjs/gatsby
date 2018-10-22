import { globalHistory as history } from "@reach/router/lib/history"

let currentPathName
let offsetY = 0

const scrollToHash = () => {
  // Make sure React has had a chance to flush to DOM first and apply styles.
  setTimeout(() => {
    const hash = window.decodeURI(window.location.hash.replace(`#`, ``))
    if (hash !== ``) {
      const element = document.getElementById(hash)
      if (element) {
        const offset = element.offsetTop
        window.scrollTo(0, offset - offsetY)
      }
    }
  }, 10)
}

history.listen(() => {
  if (location.pathname === currentPathName) {
    scrollToHash()
  }
})

exports.onClientEntry = (args, pluginOptions) => {
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY
  }
}

exports.onRouteUpdate = ({ location }, pluginOptions) => {
  scrollToHash()
  currentPathName = location.pathname
}
