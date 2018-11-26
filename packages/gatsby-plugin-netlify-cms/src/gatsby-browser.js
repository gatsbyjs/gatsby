/* global __PATH_PREFIX__ */
import netlifyIdentityWidget from "netlify-identity-widget"

exports.onInitialClientRender = (
  _,
  { enableIdentityWidget = true, publicPath = `admin` }
) => {
  if (enableIdentityWidget) {
    netlifyIdentityWidget.on(`init`, user => {
      if (!user) {
        netlifyIdentityWidget.on(`login`, () => {
          document.location.href = `${__PATH_PREFIX__}/${publicPath}/`
        })
      }
    })
    netlifyIdentityWidget.init()
  }
}
