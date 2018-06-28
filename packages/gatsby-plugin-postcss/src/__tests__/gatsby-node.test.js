const { onCreateWebpackConfig } = require(`../gatsby-node`)

describe(`gatsby-plugin-postcss`, () => {
  const actions = {
    setWebpackConfig: jest.fn(),
    replaceWebpackConfig: jest.fn(),
  }
  const loaders = {
    miniCssExtract: () => `miniCssExtract`,
    null: () => `null-loader`,
    css: args => `css-loader(${JSON.stringify(args)})`,
  }
  const getConfig = jest.fn().mockReturnValue({
    module: {
      rules: [
        {
          oneOf: [`postcss-loader`],
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
        postcss: { plugins: [`autoprefixer`], sourceMap: false },
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
