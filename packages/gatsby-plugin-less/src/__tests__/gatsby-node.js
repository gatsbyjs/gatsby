describe(`gatsby-plugin-less`, () => {
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
      "Loader options #1": {
        loaderOptions: {
          appendData: `@env: ${process.env.NODE_ENV};`,
        },
      },
      "Less options #1": {
        lessOptions: {
          modifyVars: {
            "text-color": `#fff`,
          },
          strictMath: true,
        },
      },
      "Less options #2": {
        lessOptions: {
          modifyVars: require(`../theme-test.js`),
        },
      },
      "PostCss plugins": {
        postCssPlugins: [`test1`],
      },
      "css-loader options": {
        cssLoaderOptions: {
          camelCase: false,
        },
      },
    },
  }

  tests.stages.forEach(stage => {
    for (const label in tests.options) {
      const options = tests.options[label]
      it(`Stage: ${stage} / ${label}`, () => {
        onCreateWebpackConfig({ actions, loaders, stage }, options)
        expect(actions.setWebpackConfig).toMatchSnapshot()
      })
    }
  })
})
