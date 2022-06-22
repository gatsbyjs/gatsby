const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)
const { store } = require(`../../redux`)

module.exports = function (pageComponent) {
  const cleanPageComponent = pageComponent.split(`?`)[0]
  console.log({ cleanPageComponent })
  const shadowingPlugin = new GatsbyThemeComponentShadowingResolverPlugin({
    extensions: store.getState().program.extensions,
    themes: store.getState().flattenedPlugins.map(aPlugin => {
      return {
        themeDir: aPlugin.pluginFilepath,
        themeName: aPlugin.name,
      }
    }),
    projectRoot: store.getState().program.directory,
  })
  const [theme, component] =
    shadowingPlugin.getThemeAndComponent(cleanPageComponent)

  console.log({ theme, component, cleanPageComponent })

  if (theme) {
    const componentPath = shadowingPlugin.resolveComponentPath({
      theme,
      component,
      originalRequestComponent: cleanPageComponent,
    })
    console.log({ componentPath })
    if (componentPath) {
      return componentPath
    }
  }
  return false
}
