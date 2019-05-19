const preset = require(`../`)
const path = require(`path`)

it(`Specifies proper presets and plugins for test stage`, () => {
  const { presets, plugins } = preset()

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        corejs: 2,
        loose: true,
        modules: `commonjs`,
        useBuiltIns: `usage`,
        targets: {
          node: `current`,
        },
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      {
        development: false,
        pragma: `React.createElement`,
        useBuiltIns: true,
      },
    ],
  ])
  expect(plugins).toEqual([
    [
      expect.stringContaining(
        path.join(`@babel`, `plugin-proposal-class-properties`)
      ),
      { loose: true },
    ],
    expect.stringContaining(`babel-plugin-macros`),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
    [
      expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
      {
        helpers: true,
        regenerator: true,
      },
    ],
  ])
})

it(`Specifies proper presets and plugins for build-html stage`, () => {
  const currentGatsbyBuildStage = process.env.GATSBY_BUILD_STAGE
  let presets, plugins
  try {
    process.env.GATSBY_BUILD_STAGE = `build-html`
    const config = preset()
    presets = config.presets
    plugins = config.plugins
  } finally {
    process.env.GATSBY_BUILD_STAGE = currentGatsbyBuildStage
  }

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        corejs: 2,
        loose: true,
        modules: false,
        useBuiltIns: `usage`,
        targets: {
          node: `current`,
        },
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      {
        development: false,
        pragma: `React.createElement`,
        useBuiltIns: true,
      },
    ],
  ])
  expect(plugins).toEqual([
    [
      expect.stringContaining(
        path.join(`@babel`, `plugin-proposal-class-properties`)
      ),
      { loose: true },
    ],
    expect.stringContaining(`babel-plugin-macros`),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
    [
      expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
      {
        helpers: true,
        regenerator: true,
      },
    ],
  ])
})

it(`Allows to configure browser targets`, () => {
  const targets = `last 1 version`
  const { presets } = preset(null, {
    targets,
  })

  expect(presets[0]).toEqual([
    expect.stringContaining(path.join(`@babel`, `preset-env`)),
    {
      corejs: 2,
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      targets,
    },
  ])
})
