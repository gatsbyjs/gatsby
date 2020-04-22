describe(`gatsby-plugin-sass`, () => {
  jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

  const actions = {
    setWebpackConfig: jest.fn(),
  }

  // loaders "mocks"
  const loaders = {
    miniCssExtract: () => `miniCssExtract`,
    css: args => `css(${JSON.stringify(args)})`,
    postcss: args => `postcss(${JSON.stringify(args)})`,
    null: () => `null`,
  }

  const { onCreateWebpackConfig } = require(`../gatsby-node`)

  beforeEach(() => {
    actions.setWebpackConfig.mockReset()
  })

  const tests = {
    stages: [`develop`, `build-javascript`, `develop-html`, `build-html`],
    options: {
      "No options": {},
      "Sass options": {
        includePaths: [`absolute/path/a`, `absolute/path/b`],
      },
      "PostCss plugins": {
        postCssPlugins: [`test1`],
      },
      "css-loader options": {
        cssLoaderOptions: {
          camelCase: false,
        },
      },
      "sass rule test options": {
        sassRuleTest: /\.global\.s(a|c)ss$/,
      },
      "sass rule modules test options": {
        sassRuleModulesTest: /\.global\.s(a|c)ss$/,
      },
    },
  }

  tests.stages.forEach(stage => {
    for (let label in tests.options) {
      const options = tests.options[label]
      it(`Stage: ${stage} / ${label}`, () => {
        onCreateWebpackConfig({ actions, loaders, stage }, options)
        expect(actions.setWebpackConfig).toMatchSnapshot()
      })
    }
  })
})
