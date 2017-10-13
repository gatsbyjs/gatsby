exports.onRouteUpdate = function({ location }) {
  // Wait to ensure page is rendered first.
  setTimeout(() => {
    if (
      typeof twttr !== `undefined` &&
      window.twttr.widgets &&
      typeof window.twttr.widgets.load === `function`
    ) {
      window.twttr.widgets.load()
    }
  }, 0)
}
