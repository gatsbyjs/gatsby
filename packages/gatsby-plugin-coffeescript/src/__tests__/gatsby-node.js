jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

const {
  resolvableExtensions,
  onCreateWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-coffeescript`, () => {
  it(`contains coffee script extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config with cofeescript extensions`, () => {
    const actions = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: () => `babel-loader` }

    onCreateWebpackConfig({ actions, loaders })

    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(
      resolvableExtensions().length
    )

    const lastCall = actions.setWebpackConfig.mock.calls.pop()
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
