exports.onClientEntry = () => {
  if (
    process.env.NODE_ENV !== `production` &&
    process.env.GATSBY_HOT_LOADER === `fast-refresh`
  ) {
    require(`preact/debug`)
  }
}
