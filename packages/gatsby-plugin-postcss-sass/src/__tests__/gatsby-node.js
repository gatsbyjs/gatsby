describe(`gatsby-plugin-postcss-sass`, () => {
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
          loaders: expect.arrayContaining([cssLoader, `postcss`, sassLoader]),
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
              expect.arrayContaining([cssLoader, `postcss`, sassLoader]),
            ]),
          },
        }
      },
    },
    {
      stages: [`develop-html`, `build-html`],
      loaderKeys: [`sassModules`],
      loaderConfig(sassLoader) {
        return {
          loader: {
            extractTextCalledWithArgs: expect.arrayContaining([
              expect.arrayContaining([cssLoader, `postcss`, sassLoader]),
            ]),
          },
        }
      },
    },
    {
      stages: [`build-javascript`],
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
          { options: {}, sassLoader: `sass?{}` },
          {
            options: { precision: 8 },
            sassLoader: `sass?${JSON.stringify({ precision: 8 }).toString()}`,
          },
          {
            options: { includePaths: [] },
            sassLoader: `sass?${JSON.stringify({
              includePaths: [],
            }).toString()}`,
          },
          {
            options: { precision: 8, includePaths: [] },
            sassLoader: `sass?${JSON.stringify({
              precision: 8,
              includePaths: [],
            }).toString()}`,
          },
          {
            options: { includePaths: [`./node_modules`, `./path`] },
            sassLoader: `sass?${JSON.stringify({
              includePaths: [`./node_modules`, `./path`],
            }).toString()}`,
          },
        ].forEach(({ options, sassLoader }) => {
          const stringified = JSON.stringify(options)

          it(`modifies webpack config with options ${stringified}`, () => {
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
