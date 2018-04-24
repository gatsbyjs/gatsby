describe(`gatsby-plugin-stylus`, () => {
  jest.mock(`gatsby-1-config-extract-plugin`, () => {
    return {
      extractTextPlugin: () => {
        return {
          extract: (...args) => {
            return { extractTextCalledWithArgs: args }
          },
        }
      },
    }
  })
  const { modifyWebpackConfig } = require(`../gatsby-node`)
  const cssLoader = expect.stringMatching(/^css/)
  const stylusPlugin = jest.fn().mockReturnValue(`foo`)
  ;[
    {
      stages: [`develop`],
      loaderKeys: [`stylus`, `stylusModules`],
      loaderConfig(stylusLoader) {
        return {
          loaders: expect.arrayContaining([cssLoader, stylusLoader]),
        }
      },
    },
    {
      stages: [`build-css`],
      loaderKeys: [`stylus`, `stylusModules`],
      loaderConfig(stylusLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, stylusLoader]),
            ]),
          },
        }
      },
    },
    {
      stages: [`develop-html`, `build-html`, `build-javascript`],
      loaderKeys: [`stylusModules`],
      loaderConfig(stylusLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, stylusLoader]),
            ]),
          },
        }
      },
    },
  ].forEach(({ stages, loaderKeys, loaderConfig }) => {
    stages.forEach(stage => {
      describe(`stage: ${stage}`, () => {
        ;[
          { options: {}, stylusLoader: `stylus` },
          {
            options: { use: [ stylusPlugin() ] },
            stylusLoader: `stylus`,
          },
          {
            options: { import: [ `file.js`, `file2.js` ] },
            stylusLoader: `stylus`,
          },
          {
            options: { use: [ stylusPlugin() ], import: [ `file.js`, `file2.js` ] },
            stylusLoader: `stylus`,
          },
          {
            options: { use: stylusPlugin() },
            stylusLoader: `stylus`,
          },
          {
            options: { import: `file.js` },
            stylusLoader: `stylus`,
          },
        ].forEach(({ options, stylusLoader }) => {
          const stringified = JSON.stringify(options)

          it(`modifies webpack config for ${stringified}`, () => {
            const config = {
              loader: jest.fn(),
              merge: jest.fn(),
            }

            if ((options.use && !Array.isArray(options.use)) || (options.import && !Array.isArray(options.import))) {
              expect(() => {
                modifyWebpackConfig({ config, stage }, options)
              }).toThrowError()
            } else {
              const modified = modifyWebpackConfig({ config, stage }, options)

              expect(modified).toBe(config)

              loaderKeys.forEach(loaderKey => {
                expect(config.loader).toBeCalledWith(
                  loaderKey,
                  expect.objectContaining(loaderConfig(stylusLoader))
                )

                expect(config.merge).toHaveBeenCalledTimes(Object.keys(options).length)
              })
            }
          })
        })
      })
    })
  })
})
