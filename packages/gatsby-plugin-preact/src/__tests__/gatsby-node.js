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
      name: `react-refresh/babel`,
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
    const getConfig = jest.fn()
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

    expect(getConfig).toHaveBeenCalledTimes(0)
    expect(actions.replaceWebpackConfig).toHaveBeenCalledTimes(0)
    expect(actions.setBabelPlugin).toHaveBeenCalledTimes(0)
  })
})
