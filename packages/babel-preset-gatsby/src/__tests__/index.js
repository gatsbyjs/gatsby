const preset = require(`../`)

it(`Specifies proper presets and plugins for test stage`, () => {
  const { presets, plugins } = preset()

  expect(presets).toEqual([
    [
      expect.stringContaining(`@babel/preset-env`),
      {
        loose: true,
        modules: false,
        useBuiltIns: `usage`,
        targets: {
          browsers: [`>0.25%`, `not dead`],
        },
      },
    ],
    [
      expect.stringContaining(`@babel/preset-react`),
      {
        development: false,
        pragma: `React.createElement`,
        useBuiltIns: true,
      },
    ],
  ])
  expect(plugins).toEqual([
    [
      expect.stringContaining(`@babel/plugin-proposal-class-properties`),
      { loose: true },
    ],
    expect.stringContaining(`babel-plugin-macros`),
    expect.stringContaining(`@babel/plugin-syntax-dynamic-import`),
    [
      expect.stringContaining(`@babel/plugin-transform-runtime`),
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
      expect.stringContaining(`@babel/preset-env`),
      {
        loose: true,
        modules: false,
        useBuiltIns: `usage`,
        targets: {
          node: `current`,
        },
      },
    ],
    [
      expect.stringContaining(`@babel/preset-react`),
      {
        development: false,
        pragma: `React.createElement`,
        useBuiltIns: true,
      },
    ],
  ])
  expect(plugins).toEqual([
    [
      expect.stringContaining(`@babel/plugin-proposal-class-properties`),
      { loose: true },
    ],
    expect.stringContaining(`babel-plugin-macros`),
    expect.stringContaining(`@babel/plugin-syntax-dynamic-import`),
    [
      expect.stringContaining(`@babel/plugin-transform-runtime`),
      {
        helpers: true,
        regenerator: true,
      },
    ],
  ])
})

it(`Allows to configure browser targets`, () => {
  const { presets } = preset(null, {
    targets: { browsers: [`last 1 version`] },
  })

  expect(presets[0]).toEqual([
    expect.stringContaining(`@babel/preset-env`),
    {
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      targets: {
        browsers: [`last 1 version`],
      },
    },
  ])
})
