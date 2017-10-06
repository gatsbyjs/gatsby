exports.onRouteUpdate = function({ location }) {
  if (
    typeof twttr !== `undefined` &&
    window.twttr.widgets &&
    typeof window.twttr.widgets.load === `function`
  ) {
    window.twttr.widgets.load()
  }
}
