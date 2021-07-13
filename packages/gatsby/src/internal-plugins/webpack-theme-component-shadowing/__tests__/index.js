const path = require(`path`)
const ShadowingPlugin = require(`../`)

// allow writing paths like path/to/thing, even on windows
const xplatPath = uri => uri.split(`/`).join(path.sep)
describe(`Component Shadowing`, () => {
  it.each([
    [
      // simple request path to a theme's component
      `/some/place/a-theme/src/components/a-component`,
      {
        themeDir: `/some/place/a-theme`,
        themeName: `a-theme`,
      },
      `/components/a-component`,
    ],
    [
      // simple request path to a theme's component with folder index pattern
      `/some/place/a-theme/src/components/a-component/index.js`,
      {
        themeDir: `/some/place/a-theme`,
        themeName: `a-theme`,
      },
      `/components/a-component/index.js`,
    ],
    [
      // request to a shadowed component in theme b
      // component-path is expected to be `a-theme/components/a-component`
      `/some/place/theme-b/src/a-theme/components/a-component`,
      {
        themeDir: `/some/place/theme-b`,
        themeName: `theme-b`,
      },
      `/a-theme/components/a-component`,
    ],
  ])(
    `gets matching themes`,
    (componentFullPath, { themeDir, themeName }, component) => {
      const plugin = new ShadowingPlugin({
        themes: [
          `a-theme`,
          `theme-b`,
          `gatsby-theme-c`,
          `@orgname/theme-d`,
        ].map(name => {
          return {
            themeName: name,
            themeDir: xplatPath(`/some/place/${name}`),
          }
        }),
        extensions: [],
      })
      expect(plugin.getThemeAndComponent(xplatPath(componentFullPath))).toEqual(
        [
          {
            themeDir: xplatPath(themeDir),
            themeName,
          },
          xplatPath(component),
        ]
      )
    }
  )

  it.each([
    [
      {
        // issuer is in `theme-b`
        issuerPath: `/some/node_modules/theme-b/src/a-theme/components/a-component`,
        // require'ing a file it is a "shadow child" of in a-theme
        requestPath: `/some/node_modules/a-theme/src/components/a-component`,
        userSiteDir: `/some`,
      },
      true,
    ],
    [
      {
        // issuer is in `theme-b`
        issuerPath: `/some/node_modules/theme-b/src/a-theme/components/a-component`,
        // require'ing a file it is NOT a "shadow child" of, also in theme-b
        // the `component-path` here would be "components/a-component"
        requestPath: `/some/node_modules/theme-b/src/components/a-component`,
        userSiteDir: `/some`,
      },
      false,
    ],
    [
      {
        // issuer is in the user's site
        issuerPath: `/some/src/theme-b/components/a-component`,
        // require'ing a file it is a "shadow child" of
        requestPath: `/some/node_modules/theme-b/src/components/a-component`,
        userSiteDir: `/some`,
      },
      true,
    ],
    [
      {
        // issuer is in the user's site
        issuerPath: `/some/src/@orgname/theme-d/components/a-component`,
        // require'ing a file it is a "shadow child" of
        requestPath: `/some/node_modules/@orgname/theme-d/src/components/a-component`,
        userSiteDir: `/some`,
      },
      true,
    ],
  ])(
    `can determine if the request path is in the shadow chain for the issuer`,
    ({ issuerPath, requestPath, userSiteDir }, result) => {
      const plugin = new ShadowingPlugin({
        themes: [
          `a-theme`,
          `theme-b`,
          `gatsby-theme-c`,
          `@orgname/theme-d`,
        ].map(name => {
          return {
            themeName: name,
            themeDir: xplatPath(`/some/node_modules/${name}`),
          }
        }),
      })
      const [theme, component] = plugin.getThemeAndComponent(
        xplatPath(requestPath)
      )
      expect(
        plugin.requestPathIsIssuerShadowPath({
          // issuer is in `theme-b`
          issuerPath: xplatPath(issuerPath),
          // require'ing a file it is a "shadow child" of in a-theme
          theme,
          component,
          userSiteDir: xplatPath(userSiteDir),
        })
      ).toEqual(result)
    }
  )
})
