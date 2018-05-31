exports.onRouteUpdate = (args, pluginOptions) => {
  if (
    (process.env.NODE_ENV === `production` ||
      pluginOptions.includeInDevelopment) &&
    typeof window.VK !== `undefined` &&
    typeof window.VK.Retargeting !== `undefined`
  ) {
    window.VK.Retargeting.Hit()
  }
}
