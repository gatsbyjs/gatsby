const { onCreateWebpackConfig } = require(`../gatsby-node`)

describe(`gatsby-plugin-preact`, () => {
  it(`sets the correct webpack config`, () => {
    const actions = { setWebpackConfig: jest.fn() }

    onCreateWebpackConfig({ stage: `build-javascript`, actions })

    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    expect(actions.setWebpackConfig).toHaveBeenCalledWith({
      resolve: {
        alias: {
          react: `preact/compat`,
          "react-dom": `preact/compat`,
        },
      },
    })
  })

  it(`does not invoke setWebpackConfig when stage is develop`, () => {
    const actions = { setWebpackConfig: jest.fn() }

    onCreateWebpackConfig({ stage: `develop`, actions })

    expect(actions.setWebpackConfig).not.toHaveBeenCalled()
  })
})
