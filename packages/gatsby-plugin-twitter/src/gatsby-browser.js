exports.onRouteUpdate = function({ location }) {
  if (
    typeof twttr !== `undefined` &&
    twttr.widgets &&
    typeof twttr.widgets.load === `function`
  ) {
    twttr.widgets.load()
  }
}
