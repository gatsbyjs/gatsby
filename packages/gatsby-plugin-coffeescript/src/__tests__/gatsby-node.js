const {
  resolvableExtensions,
  modifyWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-coffeescript`, () => {
  it(`contains coffee script extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config with cofeescript extensions`, () => {
    const boundActionCreators = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: () => `babel-loader` }

    modifyWebpackConfig({ boundActionCreators, loaders })

    expect(boundActionCreators.setWebpackConfig)
      .toHaveBeenCalledTimes(resolvableExtensions().length)

    const lastCall = boundActionCreators.setWebpackConfig.mock.calls.pop()
    expect(lastCall).toMatchSnapshot()
  })

  describe(`pre processing`, () => {
    it(`returns null if non-coffeescript file`, () => {
      expect(
        preprocessSource({
          filename: `test.js`,
          contents: `alert('hello');`,
        })
      ).toBe(null)
    })

    it(`transforms .coffee files`, () => {
      expect(
        preprocessSource(
          {
            filename: `test.coffee`,
            contents: `alert "I knew it!" if elvis?`,
          },
          {}
        )
      ).toMatchSnapshot()
    })
  })
})
