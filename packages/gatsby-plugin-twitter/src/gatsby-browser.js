exports.onRouteUpdate = function({ location }) {
  if (typeof twttr !== `undefined`) {
    twttr.widgets.load()
  }
}
