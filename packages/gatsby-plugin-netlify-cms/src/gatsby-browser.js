import netlifyIdentityWidget from "netlify-identity-widget"

exports.onInitialClientRender = () => {
  netlifyIdentityWidget.on(`init`, user => {
    if (!user) {
      netlifyIdentityWidget.on(`login`, () => {
        document.location.href = `/admin/`
      })
    }
  })
  netlifyIdentityWidget.init()
}
