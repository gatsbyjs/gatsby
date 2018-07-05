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

  const getConfig = jest.fn().mockReturnValue({
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.css$/,
              loaders: [`css-loader`, `postcss-loader`],
            },
            {
              test: /\.module\.css$/,
              loaders: [`css-loader`, `postcss-loader`],
            },
          ],
        },
        {
          oneOf: [
            {
              test: /\.scss$/,
              loaders: [`css-loader`, `postcss-loader`, `sass-loader`],
            },
            {
              test: /\.module\.scss$/,
              loaders: [`css-loader`, `postcss-loader`, `sass-loader`],
            },
          ],
        },
        {
          test: /\.js/,
          use: [`babel-loader`],
        },
      ],
    },
  })

  beforeEach(() => {
    actions.setWebpackConfig.mockReset()
  })

  const tests = {
    stages: [`develop`, `build-javascript`, `develop-html`, `build-html`],
    options: {
      "No options": {},
      "PostCss options": {
        postCssPlugins: [`autoprefixer`],
        sourceMap: false,
      },
    },
  }

  tests.stages.forEach(stage => {
    for (const label in tests.options) {
      const options = tests.options[label]

      it(`Stage: ${stage} / ${label}`, () => {
        onCreateWebpackConfig({ actions, loaders, stage, getConfig }, options)

        expect(actions.setWebpackConfig).toMatchSnapshot()
      })
    }
  })
})
