const { loadThemes } = require(`..`)
const path = require(`path`)

describe(`loadThemes`, () => {
  test(`resolves themes and plugins from location of gatsby-config`, async () => {
    /*
      Fixture used in this test is structured like this:

      .
      ├── gatsby-config.js
      └── node_modules
          └── gatsby-theme-child
              ├── gatsby-config.js
              ├── node_modules
              │   └── gatsby-theme-parent
              │       ├── gatsby-config.js
              │       ├── node_modules
              │       │   └── gatsby-plugin-added-by-parent-theme
              │       │       └── package.json
              │       └── package.json
              └── package.json

      This make sure we can handle cases when plugins and themes are not hoisted to root "node_modules", as well as simulates requirements for yarn PnP or pnpm
      (being able to import modules only declared as dependencies of current package).
    */

    const configFilePath = require.resolve(
      `./fixtures/resolve-from-config-location/gatsby-config`
    )
    const config = require(configFilePath)

    const {
      config: { plugins },
      themes,
    } = await loadThemes(config, {
      useLegacyThemes: false,
      configFilePath,
      rootDir: path.dirname(configFilePath),
    })

    // implicit assertion - above doesn't throw `Couldn't find the "x" plugin`

    expect(plugins.length).toEqual(3)

    // all nested plugins / themes are found
    expect(plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resolve: `gatsby-theme-child`,
        }),
        expect.objectContaining({
          resolve: `gatsby-theme-parent`,
        }),
        expect.objectContaining({
          resolve: `gatsby-plugin-added-by-parent-theme`,
        }),
      ])
    )

    expect(themes.length).toEqual(3)

    expect(themes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          themeName: `gatsby-theme-child`,
          // `gatsby-theme-child` is resolved to first level node_modules
          themeDir: path.dirname(
            require.resolve(
              `./fixtures/resolve-from-config-location/node_modules/gatsby-theme-child`
            )
          ),
        }),
        expect.objectContaining({
          themeName: `gatsby-theme-parent`,
          // `gatsby-theme-child` is resolved to second level node_modules
          themeDir: path.dirname(
            require.resolve(
              `./fixtures/resolve-from-config-location/node_modules/gatsby-theme-child/node_modules/gatsby-theme-parent`
            )
          ),
        }),

        expect.objectContaining({
          themeName: `gatsby-plugin-added-by-parent-theme`,
          // `gatsby-theme-child` is resolved to third level node_modules
          themeDir: path.dirname(
            require.resolve(
              `./fixtures/resolve-from-config-location/node_modules/gatsby-theme-child/node_modules/gatsby-theme-parent/node_modules/gatsby-plugin-added-by-parent-theme`
            )
          ),
        }),
      ])
    )
  })
})
