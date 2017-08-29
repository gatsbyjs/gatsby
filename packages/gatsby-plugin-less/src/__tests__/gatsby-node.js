describe(`gatsby-plugin-less`, () => {
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
      loaderKeys: [`less`, `lessModules`],
      loaderConfig: {
        loaders: expect.arrayContaining([cssLoader, `less`]),
      },
    },
    {
      stages: [`build-css`],
      loaderKeys: [`less`, `lessModules`],
      loaderConfig: {
        loader: {
          extractTextCalledWithArgs: expect.arrayContaining([
            expect.arrayContaining([cssLoader, `less`]),
          ]),
        },
      },
    },
    {
      stages: [`develop-html`, `build-html`, `build-javascript`],
      loaderKeys: [`lessModules`],
      loaderConfig: {
        loader: {
          extractTextCalledWithArgs: expect.arrayContaining([
            expect.arrayContaining([cssLoader, `less`]),
          ]),
        },
      },
    },
  ].forEach(({ stages, loaderKeys, loaderConfig }) => {
    stages.forEach(stage => {
      it(`modifies webpack config for stage: ${stage}`, () => {
        const config = { loader: jest.fn() }
        const modified = modifyWebpackConfig({ config, stage })

        expect(modified).toBe(config)

        loaderKeys.forEach(loaderKey =>
          expect(config.loader).toBeCalledWith(
            loaderKey,
            expect.objectContaining(loaderConfig)
          )
        )
      })
    })
  })
})
