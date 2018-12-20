/* global __PATH_PREFIX__ */

// Taken from https://github.com/netlify/netlify-identity-widget
const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/
const errorRoute = /error=access_denied&error_description=403/
const accessTokenRoute = /access_token=/

exports.onInitialClientRender = (
  _,
  { enableIdentityWidget = true, publicPath = `admin` }
) => {
  const hash = (document.location.hash || ``).replace(/^#\/?/, ``)

  if (
    enableIdentityWidget &&
    (hash.match(routes) ||
      hash.match(errorRoute) ||
      hash.match(accessTokenRoute))
  ) {
    import(`netlify-identity-widget`).then(
      ({ default: netlifyIdentityWidget }) => {
        netlifyIdentityWidget.on(`init`, user => {
          if (!user) {
            netlifyIdentityWidget.on(`login`, () => {
              document.location.href = `${__PATH_PREFIX__}/${publicPath}/`
            })
          }
        })
        netlifyIdentityWidget.init()
      }
    )
  }
}
