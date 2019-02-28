const { onCreateWebpackConfig } = require(`../gatsby-node`)

describe(`gatsby-plugin-preact`, () => {
  it(`sets the correct webpack config`, () => {
    const actions = { setWebpackConfig: jest.fn() }
    onCreateWebpackConfig({ stage: ``, actions })
    onCreateWebpackConfig({ stage: `develop-html`, actions })
    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    expect(actions.setWebpackConfig.mock.calls).toMatchSnapshot()
  })
})
