jest.mock(`path`, () => {
  return {
    resolve: () => ``,
  }
})
const {
  resolvableExtensions,
  modifyWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-typescript`, () => {
  it(`returns correct extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }

    modifyWebpackConfig({ config, babelConfig }, { compilerOptions: {} })

    expect(config.loader).toHaveBeenCalledTimes(1)
    const lastCall = config.loader.mock.calls.pop()
    expect(lastCall).toMatchSnapshot()
  })

  it(`passes the configuration to the ts-loader plugin`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }
    const options = { compilerOptions: { foo: `bar` }, transpileOnly: false }

    modifyWebpackConfig({ config, babelConfig }, options)

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        foo: `bar`,
        module: `commonjs`,
      },
      transpileOnly: false,
    }

    expect(config.loader).toHaveBeenCalledWith(`typescript`, {
      test: /\.tsx?$/,
      loaders: [
        `babel?${JSON.stringify({ plugins: [``] })}`,
        `ts-loader?${JSON.stringify(expectedOptions)}`,
      ],
    })
  })

  it(`uses default configuration for the ts-loader plugin when no config is provided`, () => {
    const babelConfig = { plugins: [``] }
    const config = {
      loader: jest.fn(),
    }
    modifyWebpackConfig({ config, babelConfig }, { compilerOptions: {} })

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        module: `commonjs`,
      },
      transpileOnly: true,
    }

    expect(config.loader).toHaveBeenCalledWith(`typescript`, {
      test: /\.tsx?$/,
      loaders: [
        `babel?${JSON.stringify({ plugins: [``] })}`,
        `ts-loader?${JSON.stringify(expectedOptions)}`,
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
