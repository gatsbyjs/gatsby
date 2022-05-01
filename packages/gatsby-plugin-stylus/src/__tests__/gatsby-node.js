describe(`gatsby-plugin-stylus`, () => {
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

  const stylusPlugin = jest.fn().mockReturnValue(`foo`)

  const tests = {
    stages: [`develop`, `build-javascript`, `develop-html`, `build-html`],
    options: {
      "No options": {},
      "Stylus options #1": {
        use: [stylusPlugin()],
      },
      "Stylus options #2": {
        use: [stylusPlugin()],
        import: [`file.js`, `file2.js`],
      },
      "PostCss plugins": {
        postCssPlugins: [`test1`],
      },
      "css-loader use commonjs": {
        cssLoaderOptions: {
          esModule: false,
          modules: {
            namedExport: false,
          },
        },
      },
    },
  }

  tests.stages.forEach(stage => {
    for (const label in tests.options) {
      const options = tests.options[label]
      it(`Stage: ${stage} / ${label}`, () => {
        onCreateWebpackConfig(
          {
            actions,
            loaders,
            stage,
          },
          options
        )
        expect(actions.setWebpackConfig).toMatchSnapshot()
      })
    }
  })
})
