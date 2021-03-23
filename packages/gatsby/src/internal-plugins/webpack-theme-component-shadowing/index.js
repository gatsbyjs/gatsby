const path = require(`path`)
const debug = require(`debug`)(`gatsby:component-shadowing`)
const fs = require(`fs`)
const _ = require(`lodash`)

// By default, a file can only be shadowed by a file of the same extension.
// However, the following table determine additionnal shadowing extensions that
// will be looked for, given the extension of the file being shadowed.
// This list maybe extended by user (by customizing webpack's configuration), in
// order to allow less common use cases (ie. allow css files being shadowed by
// a scss file, or jpg files being shadowed by png...)
const DEFAULT_ADDITIONNAL_SHADOW_EXTENSIONS = {
  js: [`js`, `ts`, `tsx`],
  ts: [`js`, `ts`, `tsx`],
  tsx: [`js`, `ts`, `tsx`],
}

// TO-DO:
//  - implement ability to add/remove shadowed modules from the webpack chain as file are being created/deleted
//    ( https://github.com/gatsbyjs/gatsby/issues/11456 ):
//    - this will also need to add memo invalidation for page template shadowing:
//      see memoized `shadowCreatePagePath` function used in `createPage` action creator.

module.exports = class GatsbyThemeComponentShadowingResolverPlugin {
  cache = {}

  constructor({ projectRoot, themes, additionnalShadowExtensions }) {
    debug(
      `themes list`,
      themes.map(({ themeName }) => themeName)
    )
    this.themes = themes
    this.projectRoot = projectRoot

    // Concatenate default additionnal extensions with those configured by user
    // then sort these in reverse length (so that something such as ".css.js"
    // get caught before ".js"); also make sure the extension itself is added in
    // the list of allowed shadow extensions.
    const additionnalShadowExtensionsList = Object.entries({
      ...DEFAULT_ADDITIONNAL_SHADOW_EXTENSIONS,
      ...(additionnalShadowExtensions || {}),
    })
    this.additionnalShadowExtensions = additionnalShadowExtensionsList
      .sort(([a], [b]) => a.length <= b.length)
      .map(([key, value]) => {
        return { key, value: [...value, key] }
      })
  }

  apply(resolver) {
    resolver
      .getHook(`before-resolved`)
      .tapAsync(
        `GatsbyThemeComponentShadowingResolverPlugin`,
        (request, stack, callback) => {
          const [theme, component] = this.getThemeAndComponent(request.path)
          if (!theme) {
            return callback()
          }

          if (
            /**
             * if someone adds
             * ```
             * modules: [path.resolve(__dirname, /src'), 'node_modules'],
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
              component,
              theme,
              issuerPath: request.context.issuer,
              userSiteDir: this.projectRoot,
            })
          ) {
            return callback()
          }

          // This is the shadowing algorithm.
          const builtComponentPath = this.resolveComponentPath({
            theme,
            component,
          })

          if (builtComponentPath) {
            return resolver.doResolve(
              resolver.hooks.describedRelative,
              { ...request, path: builtComponentPath },
              null,
              {},
              callback
            )
          } else {
            return callback()
          }
        }
      )
  }

  // check the cache, the user's project, and finally the theme files
  resolveComponentPath({ theme, component }) {
    // don't include matching theme in possible shadowing paths
    const themes = this.themes.filter(
      ({ themeName }) => themeName !== theme.themeName
    )

    const themesArray = [
      path.join(this.projectRoot, `src`, theme.themeName),
    ].concat(
      themes
        .reverse()
        .map(({ themeDir }) => path.join(themeDir, `src`, theme.themeName))
    )

    const acceptableShadowFileNames = this.getAcceptableShadowFileNames(
      path.basename(component)
    )

    for (const theme of themesArray) {
      const possibleComponentPath = path.dirname(path.join(theme, component))
      debug(`possibleComponentPath`, possibleComponentPath)

      let dir
      try {
        // we use fs/path instead of require.resolve to work with
        // TypeScript and alternate syntaxes
        dir = fs.readdirSync(possibleComponentPath)
      } catch (e) {
        continue
      }
      const existsDir = dir.map(filepath => path.basename(filepath))

      // if no exact path, search for extension
      const matchingShadowFile = acceptableShadowFileNames.find(shadowFile =>
        existsDir.includes(shadowFile)
      )
      if (matchingShadowFile) {
        return `${possibleComponentPath}/${matchingShadowFile}`
      }
    }
    return null
  }

  getThemeAndComponent(filepath) {
    // find out which theme's src/components dir we're requiring from
    const allMatchingThemes = this.themes.filter(({ themeDir }) =>
      filepath.startsWith(path.join(themeDir, `src`))
    )

    // The same theme can be included twice in the themes list causing multiple
    // matches. This case should only be counted as a single match for that theme.
    const matchingThemes = _.uniqBy(allMatchingThemes, `themeName`)

    // 0 matching themes happens a lot for paths we don't want to handle
    // > 1 matching theme means we have a path like
    //   `gatsby-theme-blog/src/components/gatsby-theme-something/src/components`
    if (matchingThemes.length > 1) {
      throw new Error(
        `Gatsby can't differentiate between themes ${matchingThemes
          .map(theme => theme.themeName)
          .join(` and `)} for path ${filepath}`
      )
    }

    if (matchingThemes.length === 0) {
      return [null, null]
    }

    const theme = matchingThemes[0]

    // get the location of the component relative to its theme's src/
    const [, component] = filepath.split(path.join(theme.themeDir, `src`))

    return [theme, component]
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

  requestPathIsIssuerShadowPath({ theme, component, issuerPath, userSiteDir }) {
    if (!theme || !component) {
      return false
    }

    // get list of potential shadow locations
    const shadowFiles = this.getBaseShadowDirsForThemes(theme.themeName)
      .concat(path.join(userSiteDir, `src`, theme.themeName))
      .map(dir => path.join(dir, component))
      .flatMap(comp => this.getAcceptableShadowFileNames(comp))

    // if the issuer is requesting a path that is a potential shadow path of itself
    return shadowFiles.includes(issuerPath)
  }

  getAcceptableShadowFileNames(componentName) {
    const matchingEntry = this.additionnalShadowExtensions.find(entry =>
      componentName.endsWith(entry.key)
    )

    // By default, a file may only be shadowed by a file of the same extension
    if (!matchingEntry) {
      return [componentName]
    }

    const baseName = componentName.slice(0, -(matchingEntry.key.length + 1))
    return matchingEntry.value.map(ext => `${baseName}.${ext}`)
  }
}
