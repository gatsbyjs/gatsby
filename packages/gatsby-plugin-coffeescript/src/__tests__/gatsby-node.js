jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)
jest.mock(`coffeescript`)

const {
  resolvableExtensions,
  onCreateWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

const { compile } = require(`coffeescript`)

describe(`gatsby-plugin-coffeescript`, () => {
  it(`contains coffee script extensions`, () => {
    expect(resolvableExtensions()).toContain(`.coffee`)
  })

  it(`modifies webpack config with coffeescript extensions`, () => {
    const actions = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: () => `babel-loader` }

    onCreateWebpackConfig({ actions, loaders })

    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(
      resolvableExtensions().length
    )

    expect(actions.setWebpackConfig).toHaveBeenLastCalledWith({
      module: {
        rules: [
          {
            test: /\.coffee$/,
            use: [`babel-loader`, `/resolved/path/coffee-loader`],
          },
        ],
      },
    })
  })

  describe(`pre processing`, () => {
    beforeEach(() => {
      compile.mockReturnValue(`complied-code`)
    })

    it(`returns null if non-coffeescript file`, () => {
      expect(
        preprocessSource({
          filename: `test.js`,
          contents: `alert('hello');`,
        })
      ).toBe(null)
      expect(compile).not.toBeCalled()
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
      ).toEqual(`complied-code`)
    })
  })
})
