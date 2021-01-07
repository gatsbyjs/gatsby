const path = require(`path`)

const GatsbyThemeComponentShadowingResolverPlugin = require(`.`)
const { store } = require(`../../redux`)

const pathWithoutExtension = fullPath => {
  const parsed = path.parse(fullPath)
  return path.join(parsed.dir, parsed.name)
}

module.exports = function (pageComponent) {
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
  const matchingThemes = shadowingPlugin.getMatchingThemesForPath(pageComponent)
  if (matchingThemes.length > 1) {
    throw new Error(
      `Gatsby can't differentiate between themes ${matchingThemes
        .map(theme => theme.themeName)
        .join(` and `)} for path ${pageComponent}`
    )
  }

  if (matchingThemes.length == 1) {
    const [theme] = matchingThemes

    const pageComponentWithoutExtension = pathWithoutExtension(pageComponent)
    const [, component] = pageComponentWithoutExtension.split(
      path.join(theme.themeDir, `src`)
    )
    const componentPath = shadowingPlugin.resolveComponentPath({
      matchingTheme: theme.themeName,
      themes: shadowingPlugin.themes,
      component,
    })
    if (componentPath) {
      return componentPath
    }
  }
  return false
}
