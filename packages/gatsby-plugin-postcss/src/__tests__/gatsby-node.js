describe(`gatsby-plugin-postcss`, () => {
  jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

  const actions = {
    setWebpackConfig: jest.fn(),
    replaceWebpackConfig: jest.fn(),
  }

  const loaders = {
    miniCssExtract: () => `miniCssExtract`,
    null: () => `null-loader`,
    css: args => `css-loader(${JSON.stringify(args)})`,
  }

  const { onCreateWebpackConfig } = require(`../gatsby-node`)

  const tests = {
    stages: [`develop`, `build-javascript`, `develop-html`, `build-html`],
    options: {
      "No options": {},
      "PostCss options": { postCssPlugins: [`autoprefixer`], sourceMap: false },
      "Css options": { cssLoaderOptions: { camelCase: true } },
      "Css options commonjs": {
        cssLoaderOptions: {
          esModule: false,
          modules: {
            namedExport: false,
          },
        },
      },
    },
    configs: {
      "No options": jest.fn().mockReturnValue({
        module: {
          rules: [
            {
              test: /\.js/,
              use: [`babel-loader`],
            },
          ],
        },
      }),
      "PostCss options": jest.fn().mockReturnValue({
        module: {
          rules: [
            {
              oneOf: [
                {
                  test: /\.css$/,
                  loaders: [`css-loader`],
                },
                {
                  test: /\.module\.css$/,
                  loaders: [`css-loader`],
                },
              ],
            },
            {
              test: /\.js/,
              use: [`babel-loader`],
            },
          ],
        },
      }),
      "Css options": jest.fn().mockReturnValue({
        module: {
          rules: [
            {
              oneOf: [
                {
                  test: /\.css$/,
                  loaders: [`css-loader`],
                },
                {
                  test: /\.module\.css$/,
                  loaders: [`css-loader`],
                },
              ],
            },
            {
              test: /\.js/,
              use: [`babel-loader`],
            },
          ],
        },
      }),
      "Css options commonjs": jest.fn().mockReturnValue({
        module: {
          rules: [
            {
              oneOf: [
                {
                  test: /\.css$/,
                  loaders: [`css-loader`],
                },
                {
                  test: /\.module\.css$/,
                  loaders: [`css-loader`],
                },
              ],
            },
            {
              test: /\.js/,
              use: [`babel-loader`],
            },
          ],
        },
      }),
    },
    actions: {
      "No options": actions.setWebpackConfig,
      "PostCss options": actions.replaceWebpackConfig,
      "Css options": actions.replaceWebpackConfig,
      "Css options commonjs": actions.replaceWebpackConfig,
    },
  }

  beforeEach(() => {
    actions.setWebpackConfig.mockClear()
    actions.replaceWebpackConfig.mockClear()
  })

  tests.stages.forEach(stage => {
    for (const label in tests.options) {
      const options = tests.options[label]

      it(`Stage: ${stage} / ${label}`, () => {
        const getConfig = tests.configs[label]
        const action = tests.actions[label]

        onCreateWebpackConfig({ actions, loaders, stage, getConfig }, options)

        expect(action).toMatchSnapshot()
      })
    }
  })
})
