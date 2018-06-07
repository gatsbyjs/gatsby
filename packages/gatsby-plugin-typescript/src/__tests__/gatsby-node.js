jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

const {
  resolvableExtensions,
  onCreateWebpackConfig,
} = require(`../gatsby-node`)
const { tsPresetsFromJsPresets } = require(`../`)
const tsPresetPath = `/resolved/path/@babel/preset-typescript`
const jsOptions = {
  options: {
    presets: [
      [`@babel/preset-env`],
      [`@babel/preset-react`],
      [`@babel/preset-flow`],
    ],
    plugins: [`babel-plugin-remove-graphql-queries`],
  },
  loader: `/resolved/path/babel-loader`,
}

describe(`tsPresetsFromJsPresets`, () => {
  it(`handles empty presets`, () => {
    const presets = []
    expect(tsPresetsFromJsPresets(presets)).toEqual([tsPresetPath])
  })
  it(`replaces preset-flow if it's last`, () => {
    const presets = [`@babel/preset-flow`]
    expect(tsPresetsFromJsPresets(presets)).toEqual([tsPresetPath])
  })
  it(`appends if preset-flow is not last`, () => {
    const presets = [[`@babel/preset-flow`], [`@babel/preset-foo`]]
    expect(tsPresetsFromJsPresets(presets)).toEqual(
      presets.concat([tsPresetPath])
    )
  })
})

describe(`gatsby-plugin-typescript`, () => {
  let args

  beforeEach(() => {
    const actions = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: jest.fn(() => jsOptions) }
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

    onCreateWebpackConfig(
      { config, babelConfig, ...args },
      { compilerOptions: {} }
    )

    expect(args.actions.setWebpackConfig).toHaveBeenCalledTimes(1)
    const lastCall = args.actions.setWebpackConfig.mock.calls.pop()
    expect(lastCall).toMatchSnapshot()
  })
})
