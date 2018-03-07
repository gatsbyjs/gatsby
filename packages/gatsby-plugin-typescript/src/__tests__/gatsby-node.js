jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

const babelPluginRemoveQueries = require(`babel-plugin-remove-graphql-queries`)
  .default
const {
  resolvableExtensions,
  onCreateWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-typescript`, () => {
  let args

  function getLoader() {
    const call = args.actions.setWebpackConfig.mock.calls[0]
    return call[0].module.rules[0]
  }

  beforeEach(() => {
    const actions = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: jest.fn(() => `babel-loader`) }
    args = { actions, loaders }
  })

  it(`returns correct extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }

    onCreateWebpackConfig({ config, babelConfig }, { compilerOptions: {} })

    expect(args.actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    const lastCall = args.actions.setWebpackConfig.mock.calls.pop()
    expect(lastCall).toMatchSnapshot()
  })

  it(`adds the remove graphql queries plugin`, () => {
    onCreateWebpackConfig(args, { compilerOptions: {} })

    expect(args.loaders.js).toHaveBeenCalledTimes(1)
    const lastCall = args.loaders.js.mock.calls.pop()

    expect(lastCall[0]).toEqual({
      plugins: [babelPluginRemoveQueries],
    })
  })

  it(`passes the configuration to the ts-loader plugin`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }
    const options = { compilerOptions: { foo: `bar` }, transpileOnly: false }

    onCreateWebpackConfig({ config, babelConfig }, options)

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        foo: `bar`,
        module: `es6`,
      },
      transpileOnly: false,
    }

    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [
        `babel-loader`,
        {
          loader: `/resolved/path/ts-loader`,
          options: expectedOptions,
        },
      ],
    })
  })

  it(`uses default configuration for the ts-loader plugin when no config is provided`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }
    onCreateWebpackConfig({ config, babelConfig }, { compilerOptions: {} })

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        module: `es6`,
      },
      transpileOnly: true,
    }

    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [
        `babel-loader`,
        {
          loader: `/resolved/path/ts-loader`,
          options: expectedOptions,
        },
      ],
    })
  })

  describe(`pre-processing`, () => {
    const opts = { compilerOptions: {} }
    it(`leaves non-tsx? files alone`, () => {
      expect(
        preprocessSource(
          {
            contents: `alert('hello');`,
            filename: `test.js`,
          },
          opts
        )
      ).toBeNull()
    })

    it(`transforms .ts files`, () => {
      const js = preprocessSource(
        {
          filename: `index.ts`,
          contents: `
          declare let moment: any;

          const now: string = moment().format('HH:MM:ss');
        `,
        },
        opts
      )
      expect(js).not.toBeNull()
      expect(js).toMatchSnapshot()
    })

    it(`transforms JSX files`, () => {
      const js = preprocessSource(
        {
          filename: `tags.ts`,
          contents: `
          import * as React from 'react';

          export default () => <h1>Hello World</h1>;
        `,
        },
        opts
      )

      expect(js).not.toBeNull()
      expect(js).toMatchSnapshot()
    })
  })
})
