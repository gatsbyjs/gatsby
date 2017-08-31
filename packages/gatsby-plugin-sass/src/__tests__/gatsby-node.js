describe(`gatsby-plugin-sass`, () => {
  jest.mock(`extract-text-webpack-plugin`, () => {
    return {
      extract(...args) {
        return { extractTextCalledWithArgs: args }
      },
    }
  })

  const { modifyWebpackConfig } = require(`../gatsby-node`)
  const cssLoader = expect.stringMatching(/^css/)
  ;[
    {
      stages: [`develop`],
      loaderKeys: [`sass`, `sassModules`],
      loaderConfig(sassLoader) {
        return {
          loaders: expect.arrayContaining([cssLoader, sassLoader]),
        }
      },
    },
    {
      stages: [`build-css`],
      loaderKeys: [`sass`, `sassModules`],
      loaderConfig(sassLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, sassLoader]),
            ]),
          },
        }
      },
    },
    {
      stages: [`develop-html`, `build-html`, `build-javascript`],
      loaderKeys: [`sassModules`],
      loaderConfig(sassLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, sassLoader]),
            ]),
          },
        }
      },
    },
  ].forEach(({ stages, loaderKeys, loaderConfig }) => {
    stages.forEach(stage => {
      describe(`stage: ${stage}`, () => {
        ;[
          { options: {}, sassLoader: `sass` },
          { options: { precision: 8 }, sassLoader: `sass?precision=8` },
        ].forEach(({ options, sassLoader }) => {
          const stringified = JSON.stringify(options)

          it(`modifies webpack config for ${stringified}`, () => {
            const config = { loader: jest.fn() }
            const modified = modifyWebpackConfig({ config, stage }, options)

            expect(modified).toBe(config)

            loaderKeys.forEach(loaderKey =>
              expect(config.loader).toBeCalledWith(
                loaderKey,
                expect.objectContaining(loaderConfig(sassLoader))
              )
            )
          })
        })
      })
    })
  })
})
