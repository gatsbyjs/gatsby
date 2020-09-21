const { onCreateWebpackConfig } = require(`../gatsby-node`)
const PreactRefreshPlugin = require(`@prefresh/webpack`)
const ReactRefreshWebpackPlugin = require(`@pmmmwh/react-refresh-webpack-plugin`)

describe(`gatsby-plugin-preact`, () => {
  it(`sets the correct webpack config in development`, () => {
    const getConfig = jest.fn(() => {
      return {
        plugins: [new ReactRefreshWebpackPlugin()],
      }
    })
    const actions = {
      setWebpackConfig: jest.fn(),
      setBabelPlugin: jest.fn(),
      replaceWebpackConfig: jest.fn(),
    }

    onCreateWebpackConfig({ stage: `develop`, actions, getConfig })

    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    expect(actions.setWebpackConfig).toHaveBeenCalledWith({
      plugins: [new PreactRefreshPlugin()],
      resolve: {
        alias: {
          react: `preact/compat`,
          "react-dom": `preact/compat`,
        },
      },
    })

    expect(getConfig).toHaveBeenCalledTimes(1)
    expect(actions.setBabelPlugin).toHaveBeenCalledTimes(1)
    expect(actions.setBabelPlugin).toHaveBeenCalledWith({
      name: `@prefresh/babel-plugin`,
    })
    expect(actions.replaceWebpackConfig).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "plugins": Array [],
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `)
  })

  it(`sets the correct webpack config in production`, () => {
    const FRAMEWORK_BUNDLES = [`react`, `react-dom`, `scheduler`, `prop-types`]
    const getConfig = jest.fn(() => {
      return {
        optimization: {
          splitChunks: {
            chunks: `all`,
            cacheGroups: {
              default: false,
              vendors: false,
              framework: {
                chunks: `all`,
                name: `framework`,
                // This regex ignores nested copies of framework libraries so they're bundled with their issuer.
                test: new RegExp(
                  `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
                    `|`
                  )})[\\\\/]`
                ),
                priority: 40,
                // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
                enforce: true,
              },
            },
          },
        },
      }
    })
    const actions = {
      setWebpackConfig: jest.fn(),
      setBabelPlugin: jest.fn(),
      replaceWebpackConfig: jest.fn(),
    }

    onCreateWebpackConfig({ stage: `build-javascript`, actions, getConfig })

    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    expect(actions.setWebpackConfig).toHaveBeenCalledWith({
      plugins: [],
      resolve: {
        alias: {
          react: `preact/compat`,
          "react-dom": `preact/compat`,
        },
      },
    })

    expect(getConfig).toHaveBeenCalledTimes(1)
    expect(actions.setBabelPlugin).toHaveBeenCalledTimes(0)
    expect(actions.replaceWebpackConfig).toHaveBeenCalledTimes(1)
    expect(actions.replaceWebpackConfig).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "optimization": Object {
                "splitChunks": Object {
                  "cacheGroups": Object {
                    "default": false,
                    "framework": Object {
                      "chunks": "all",
                      "enforce": true,
                      "name": "framework",
                      "priority": 40,
                      "test": [Function],
                    },
                    "vendors": false,
                  },
                  "chunks": "all",
                },
              },
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `)
  })
})
