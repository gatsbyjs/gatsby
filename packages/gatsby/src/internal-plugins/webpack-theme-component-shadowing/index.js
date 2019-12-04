const path = require(`path`)
const debug = require(`debug`)(`gatsby:component-shadowing`)
const fs = require(`fs`)
const _ = require(`lodash`)

const pathWithoutExtension = fullPath => {
  const parsed = path.parse(fullPath)
  return path.join(parsed.dir, parsed.name)
}

// TO-DO:
//  - implement ability to add/remove shadowed modules from the webpack chain as file are being created/deleted
//    ( https://github.com/gatsbyjs/gatsby/issues/11456 ):
//    - this will also need to add memo invalidation for page template shadowing:
//      see memoized `shadowCreatePagePath` function used in `createPage` action creator.

module.exports = class GatsbyThemeComponentShadowingResolverPlugin {
  cache = {}

  constructor({ projectRoot, themes, extensions }) {
    debug(
      `themes list`,
      themes.map(({ themeName }) => themeName)
    )
    this.themes = themes
    this.projectRoot = projectRoot
    this.extensions = extensions
  }

  apply(resolver) {
    resolver.hooks.relative.tapAsync(
      `GatsbyThemeComponentShadowingResolverPlugin`,
      (request, stack, callback) => {
        const matchingThemes = this.getMatchingThemesForPath(request.path)

        // 0 matching themes happens a lot for paths we don't want to handle
        // > 1 matching theme means we have a path like
        //   `gatsby-theme-blog/src/components/gatsby-theme-something/src/components`
        if (matchingThemes.length > 1) {
          throw new Error(
            `Gatsby can't differentiate between themes ${matchingThemes
              .map(theme => theme.themeName)
              .join(` and `)} for path ${request.path}`
          )
        }

        if (matchingThemes.length !== 1) {
          return callback()
        }

        // theme is the theme package from which we're requiring the relative component
        const [theme] = matchingThemes
        // get the location of the component relative to src/
        const [, component] = request.path.split(
          path.join(theme.themeDir, `src`)
        )

        if (
          /**
           * if someone adds
           * ```
           * modules: [path.resolve(__dirname, 'src'), 'node_modules'],
           * ```
           * to the webpack config, `issuer` is `null`, so we skip this check.
           * note that it's probably a bad idea in general to set `modules`
           * like this in a theme, but we also shouldn't artificially break
           * people that do.
           */
          request.context.issuer &&
          /**
           * An issuer is the file making the require request. It can
           * be in a user's site or a theme. If the issuer is requesting
           * a path in the shadow chain that it participates in, then we
           * will let the request through as normal. Otherwise, we
           * engage the shadowing algorithm.
           */
          this.requestPathIsIssuerShadowPath({
            requestPath: request.path,
            issuerPath: request.context.issuer,
            userSiteDir: this.projectRoot,
          })
        ) {
          return resolver.doResolve(
            resolver.hooks.describedRelative,
            request,
            null,
            {},
            callback
          )
        }

        // This is the shadowing algorithm.
        const builtComponentPath = this.resolveComponentPath({
          matchingTheme: theme.themeName,
          themes: this.themes,
          component,
        })

        return resolver.doResolve(
          resolver.hooks.describedRelative,
          { ...request, path: builtComponentPath || request.path },
          null,
          {},
          callback
        )
      }
    )
  }

  // check the cache, the user's project, and finally the theme files
  resolveComponentPath({ matchingTheme: theme, themes: ogThemes, component }) {
    // don't include matching theme in possible shadowing paths
    const themes = ogThemes.filter(({ themeName }) => themeName !== theme)

    return [path.join(this.projectRoot, `src`, theme)]
      .concat(
        Array.from(themes)
          .reverse()
          .map(({ themeDir }) => path.join(themeDir, `src`, theme))
      )
      .map(dir => path.join(dir, component))
      .find(possibleComponentPath => {
        debug(`possibleComponentPath`, possibleComponentPath)
        let dir
        try {
          // we use fs/path instead of require.resolve to work with
          // TypeScript and alternate syntaxes
          dir = fs.readdirSync(path.dirname(possibleComponentPath))
        } catch (e) {
          return false
        }
        const existsDir = dir.map(filepath => path.basename(filepath))
        const exists =
          // has extension, will match styles.css;

          // import Thing from 'whatever.tsx'
          // extensions: [.js, .tsx]
          // site/src/whatever.tsx site/src/whatever.js.

          //exact matches
          existsDir.includes(path.basename(possibleComponentPath)) ||
          // .js matches
          // styles.css.js
          // whatever.tsx.js
          this.extensions.find(ext =>
            existsDir.includes(path.basename(possibleComponentPath) + ext)
          )
        return exists
      })
  }

  getMatchingThemesForPath(filepath) {
    // find out which theme's src/components dir we're requiring from
    const allMatchingThemes = this.themes.filter(({ themeDir }) =>
      filepath.includes(path.join(themeDir, `src`))
    )

    // The same theme can be included twice in the themes list causing multiple
    // matches. This case should only be counted as a single match for that theme.
    return _.uniqBy(allMatchingThemes, `themeName`)
  }

  // given a theme name, return all of the possible shadow locations
  getBaseShadowDirsForThemes(theme) {
    return Array.from(this.themes)
      .reverse()
      .map(({ themeName, themeDir }) => {
        if (themeName === theme) {
          return path.join(themeDir, `src`)
        } else {
          return path.join(themeDir, `src`, theme)
        }
      })
  }

  requestPathIsIssuerShadowPath({ requestPath, issuerPath, userSiteDir }) {
    // get the issuer's theme
    const matchingThemes = this.getMatchingThemesForPath(requestPath)
    if (matchingThemes.length !== 1) {
      return false
    }
    const [theme] = matchingThemes

    // get the location of the component relative to src/
    const [, component] = requestPath.split(path.join(theme.themeDir, `src`))

    // get list of potential shadow locations
    const shadowFiles = this.getBaseShadowDirsForThemes(theme.themeName)
      .concat(path.join(userSiteDir, `src`, theme.themeName))
      .map(dir => path.join(dir, component))

    // if the issuer is requesting a path that is a potential shadow path of itself
    return shadowFiles.includes(pathWithoutExtension(issuerPath))
  }
}
