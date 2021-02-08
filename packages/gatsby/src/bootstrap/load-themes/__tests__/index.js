const loadThemes = require(`..`)
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

  describe(`de-duplicating plugins with redirected plugin paths`, () => {
    /*
      Fixture used in this test is structured like this:
      .
      ├── gatsby-config-broken.js
      ├── gatsby-config-working.js
      └── node_modules
          ├── gatsby-theme-broken
          │   ├── gatsby-config.js
          │   ├── node_modules
          │   │   └── gatsby-theme-child
          │   │       ├── gatsby-config.js
          │   │       └── package.json
          │   └── package.json
          ├── gatsby-theme-test
          │   ├── gatsby-config.js
          │   ├── node_modules
          │   │   └── gatsby-plugin-test
          │   │       └── package.json
          │   └── package.json
          └── gatsby-theme-working
              ├── gatsby-config.js
              ├── node_modules
              │   └── gatsby-theme-child
              │       ├── gatsby-config.js
              │       └── package.json
              └── package.json

      This is use to make sure that we can manually define a directory where a plugin/theme can be found in order to
      ensure compatibility with pnpm/yarn2 without breaking de-duplication.
    */

    const getFixturePath = path.join.bind(
      path,
      __dirname,
      `fixtures`,
      `respect-defined-plugin-dir`
    )

    test(`plugins are not de-duplicated when resolve is absolute path`, async () => {
      const configFilePath = require.resolve(
        getFixturePath(`gatsby-config-broken`)
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

      expect(plugins.length).toEqual(5)

      // Plugin collection should be what we are expecting
      expect(plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            resolve: `gatsby-theme-broken`,
            parentDir: getFixturePath(),
          }),

          // gatsby-theme-broken resolves gatsby-theme-test to a absolute path
          // here, causing it not to be de-duplicated
          expect.objectContaining({
            resolve: getFixturePath(`node_modules/gatsby-theme-test`),
            parentDir: getFixturePath(`node_modules/gatsby-theme-broken`),
          }),
          expect.objectContaining({
            resolve: `gatsby-theme-child`,
            parentDir: getFixturePath(`node_modules/gatsby-theme-broken`),
          }),

          // gatsby-theme-child also includes gatsby-theme-test, but without an absolute
          // path
          expect.objectContaining({
            resolve: `gatsby-theme-test`,
            parentDir: getFixturePath(
              `node_modules/gatsby-theme-broken/node_modules/gatsby-theme-child`
            ),
          }),

          // A plugin included by gatsby-theme-test
          expect.objectContaining({
            resolve: `gatsby-plugin-test`,
            parentDir: getFixturePath(`node_modules/gatsby-theme-test`),
          }),
        ])
      )

      // Make sure the theme specifications are what we are expecting
      expect(themes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            themeName: `gatsby-theme-broken`,
            // gatsby-theme-broken is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-broken`),
            // and is owned by the default site
            parentDir: getFixturePath(),
          }),

          // de-duplication unsuccessful because of absolute path in themeName
          expect.objectContaining({
            themeName: getFixturePath(`node_modules/gatsby-theme-test`),
            // gatsby-theme-test is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-test`),
            // and is owned by the gatsby-theme-broken
            parentDir: getFixturePath(`node_modules/gatsby-theme-broken`),
          }),

          expect.objectContaining({
            themeName: `gatsby-theme-child`,
            // `gatsby-theme-child` is resolved to second level node_modules
            themeDir: getFixturePath(
              `node_modules/gatsby-theme-broken/node_modules/gatsby-theme-child`
            ),
            // and is owned by gatsby-theme-broken
            parentDir: getFixturePath(`node_modules/gatsby-theme-broken`),
          }),

          expect.objectContaining({
            themeName: `gatsby-theme-test`,
            // `gatsby-theme-test` is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-test`),
            // and is owned by gatsby-theme-child
            parentDir: getFixturePath(
              `node_modules/gatsby-theme-broken/node_modules/gatsby-theme-child`
            ),
          }),

          expect.objectContaining({
            themeName: `gatsby-plugin-test`,
            // `gatsby-plugin-test` is resolved to second level node_modules
            themeDir: getFixturePath(
              `node_modules/gatsby-theme-test/node_modules/gatsby-plugin-test`
            ),
            // and is owned by gatsby-theme-test
            parentDir: getFixturePath(`node_modules/gatsby-theme-test`),
          }),
        ])
      )
    })

    test(`parentDir is respected when defined manually, allowing de-duplication`, async () => {
      const configFilePath = require.resolve(
        getFixturePath(`gatsby-config-working`)
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

      expect(plugins.length).toEqual(4)

      // Plugin collection should be what we are expecting
      expect(plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            resolve: `gatsby-theme-working`,
            parentDir: getFixturePath(),
          }),

          // gatsby-theme-working includes gatsby-theme-test, but manually defines
          // parentDir to make it point to default site's directory
          expect.objectContaining({
            resolve: `gatsby-theme-test`,
            parentDir: getFixturePath(),
          }),
          expect.objectContaining({
            resolve: `gatsby-theme-child`,
            parentDir: getFixturePath(`node_modules/gatsby-theme-working`),
          }),

          // Plugin included by gatsby-theme-test
          expect.objectContaining({
            resolve: `gatsby-plugin-test`,
            parentDir: getFixturePath(`node_modules/gatsby-theme-test`),
          }),
        ])
      )

      // gatsby-theme-child ALSO includes gatsby-theme-test, but because the first
      // one included by gatsby-theme-working wasn't an absolute path, it is
      // correctly de-duplicated and not present in this collection.
      expect(plugins).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            resolve: `gatsby-theme-test`,
            parentDir: getFixturePath(
              `node_modules/gatsby-theme-working/node_modules/gatsby-theme-child`
            ),
          }),
        ])
      )

      // Make sure the theme specifications are what we are expecting
      expect(themes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            themeName: `gatsby-theme-working`,
            // gatsby-theme-working is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-working`),
            // and is owned by the default site
            parentDir: getFixturePath(),
          }),

          expect.objectContaining({
            themeName: `gatsby-theme-test`,
            // gatsby-theme-test is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-test`),
            // and is owned by the default site, as specified by gatsby-theme-working
            parentDir: getFixturePath(),
          }),

          expect.objectContaining({
            themeName: `gatsby-theme-child`,
            // `gatsby-theme-child` is resolved to second level node_modules
            themeDir: getFixturePath(
              `node_modules/gatsby-theme-working/node_modules/gatsby-theme-child`
            ),
            // and is owned by gatsby-theme-working
            parentDir: getFixturePath(`node_modules/gatsby-theme-working`),
          }),

          // The second gatsby-theme-test, included by gatsby-theme-child, is deduplicated
          // in the plugin array
          expect.objectContaining({
            themeName: `gatsby-theme-test`,
            // gatsby-theme-test is resolved to first level node_modules
            themeDir: getFixturePath(`node_modules/gatsby-theme-test`),
            // and is owned by gatsby-theme-child
            parentDir: getFixturePath(
              `node_modules/gatsby-theme-working/node_modules/gatsby-theme-child`
            ),
          }),

          expect.objectContaining({
            themeName: `gatsby-plugin-test`,
            // `gatsby-plugin-test` is resolved to second level node_modules
            themeDir: getFixturePath(
              `node_modules/gatsby-theme-test/node_modules/gatsby-plugin-test`
            ),
            // and is owned by gatsby-theme-test
            parentDir: getFixturePath(`node_modules/gatsby-theme-test`),
          }),
        ])
      )
    })
  })
})
