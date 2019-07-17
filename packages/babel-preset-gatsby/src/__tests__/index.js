const preset = require(`../`)
const path = require(`path`)

it(`Specifies proper presets and plugins for test stage`, () => {
  const { presets, plugins } = preset()

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        exclude: [`transform-typeof-symbol`],
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
        absoluteRuntimePath: expect.stringContaining(
          path.join(`@babel`, `runtime`)
        ),
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `plugin-transform-spread`)),
      {
        loose: false,
      },
    ],
    expect.stringContaining(`babel-plugin-dynamic-import-node`),
  ])
})

it(`Specifies proper presets and plugins for build-html stage`, () => {
  const config = preset(null, { stage: `build-html` })
  const presets = config.presets
  const plugins = config.plugins

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        exclude: [`transform-typeof-symbol`],
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
        absoluteRuntimePath: expect.stringContaining(
          path.join(`@babel`, `runtime`)
        ),
        helpers: false,
        regenerator: true,
        corejs: false,
        useESModules: true,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `plugin-transform-spread`)),
      {
        loose: false,
      },
    ],
    expect.stringContaining(`babel-plugin-dynamic-import-node`),
  ])
})

it(`Allows to configure browser targets`, () => {
  const targets = `last 1 version`
  const { presets } = preset(null, {
    stage: `build-javascript`,
    targets,
  })

  expect(presets[0]).toEqual([
    expect.stringContaining(path.join(`@babel`, `preset-env`)),
    {
      exclude: [`transform-typeof-symbol`],
      corejs: 2,
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      targets,
    },
  ])
})

it(`Allows to configure modern builds`, () => {
  const targets = `last 1 version`
  const { presets } = preset(null, {
    stage: `build-javascript`,
    targets,
    modern: true,
  })

  expect(presets[0]).toEqual([
    expect.stringContaining(path.join(`@babel`, `preset-env`)),
    {
      corejs: 2,
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      targets: {
        esmodules: true,
      },
    },
  ])
})

describe(`in production mode`, () => {
  it(`adds babel-plugin-transform-react-remove-prop-types`, () => {
    const { plugins } = preset(null, {
      stage: `build-javascript`,
    })

    expect(plugins).toEqual(
      expect.arrayContaining([
        [
          expect.stringContaining(
            path.join(`babel-plugin-transform-react-remove-prop-types`)
          ),
          {
            removeImport: true,
          },
        ],
      ])
    )
  })
})
