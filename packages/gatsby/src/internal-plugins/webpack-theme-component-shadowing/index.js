const path = require(`path`)
const report = require(`gatsby-cli/lib/reporter`)

module.exports = class GatsbyThemeComponentShadowingResolverPlugin {
  cache = {}

  constructor({ projectRoot, themes }) {
    this.themes = themes
    this.projectRoot = projectRoot
  }

  apply(resolver) {
    resolver.plugin(`relative`, (request, callback) => {
      // find out which theme's src/components dir we're requiring from
      const matchingThemes = this.themes.filter(name =>
        request.path.includes(path.join(name, `src`, `components`))
      )
      // 0 matching themes happens a lot fo rpaths we don't want to handle
      // > 1 matching theme means we have a path like
      //   `gatsby-theme-blog/src/components/gatsby-theme-something/src/components`
      if (matchingThemes.length > 1) {
        throw new Error(
          `Gatsby can't differentiate between themes ${matchingThemes.join(
            ` and `
          )} for path ${request.path}`
        )
      }
      if (matchingThemes.length !== 1) {
        return callback()
      }
      // theme is the theme package from which we're requiring the relative component
      const [theme] = matchingThemes
      // get the location of the component relative to src/components
      const [, component] = request.path.split(
        path.join(theme, `src`, `components`)
      )

      const builtComponentPath = this.resolveComponentPath({
        theme,
        component,
        projectRoot: this.projectRoot,
      })
      if (!builtComponentPath) {
        // if you mess up your component imports in a theme, resolveComponentPath will return undefined
        report.panic(
          `We can't find the component located at ${
            request.path
          } and imported in ${request.context.issuer}`
        )
      }
      const resolvedComponentPath = require.resolve(builtComponentPath)
      // this callbackends the resolver fallthrough chain.
      return callback(null, {
        directory: request.directory,
        path: resolvedComponentPath,
        query: request.query,
        request: ``,
      })
    })
  }

  // check the cache, the user's project, and finally the theme files
  resolveComponentPath({ theme, component, projectRoot }) {
    if (!this.cache[`${theme}-${component}`]) {
      this.cache[`${theme}-${component}`] = [
        path.join(projectRoot, `src`, `components`, theme),
        path.join(path.dirname(require.resolve(theme)), `src`, `components`),
      ]
        .map(dir => path.join(dir, component))
        .find(possibleComponentPath => {
          try {
            require.resolve(possibleComponentPath)
            return true
          } catch (e) {
            return false
          }
        })
    }

    return this.cache[`${theme}-${component}`]
  }
}
