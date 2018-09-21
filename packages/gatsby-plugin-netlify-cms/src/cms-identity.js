/* global __PATH_PREFIX__ CMS_PUBLIC_PATH */
import netlifyIdentityWidget from "netlify-identity-widget"

window.netlifyIdentity = netlifyIdentityWidget
netlifyIdentityWidget.on(`init`, user => {
  if (!user) {
    netlifyIdentityWidget.on(`login`, () => {
      document.location.href = `${__PATH_PREFIX__}/${CMS_PUBLIC_PATH}/`
    })
  }
})
netlifyIdentityWidget.init()
