const preset = require(`../`)
const path = require(`path`)

it(`Specifies proper presets and plugins in Node mode`, () => {
  const { presets, plugins } = preset()

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        debug: false,
        loose: true,
        modules: `commonjs`,
        shippedProposals: true,
        targets: {
          node: `current`,
        },
        useBuiltIns: `entry`,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      { development: true },
    ],
    expect.stringContaining(path.join(`@babel`, `preset-flow`)),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-class-properties`)
    ),
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-optional-chaining`)
    ),
    expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
  ])
})

it(`Specifies proper presets and plugins in debug Node mode`, () => {
  const { presets, plugins } = preset(null, { debug: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        debug: true,
        loose: true,
        modules: `commonjs`,
        shippedProposals: true,
        targets: {
          node: `current`,
        },
        useBuiltIns: `entry`,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      { development: true },
    ],
    expect.stringContaining(path.join(`@babel`, `preset-flow`)),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-class-properties`)
    ),
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-optional-chaining`)
    ),
    expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
  ])
})

it(`Specifies proper presets and plugins in browser mode`, () => {
  const { presets, plugins } = preset(null, { browser: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        debug: false,
        loose: true,
        modules: `commonjs`,
        shippedProposals: true,
        targets: {
          browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
        },
        useBuiltIns: false,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      { development: true },
    ],
    expect.stringContaining(path.join(`@babel`, `preset-flow`)),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-class-properties`)
    ),
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-optional-chaining`)
    ),
    expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
  ])
})

it(`Specifies proper presets and plugins in debug browser mode`, () => {
  const { presets, plugins } = preset(null, { browser: true, debug: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(path.join(`@babel`, `preset-env`)),
      {
        debug: true,
        loose: true,
        modules: `commonjs`,
        shippedProposals: true,
        targets: {
          browsers: [`last 2 versions`, `not ie <= 11`, `not android 4.4.3`],
        },
        useBuiltIns: false,
      },
    ],
    [
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      { development: true },
    ],
    expect.stringContaining(path.join(`@babel`, `preset-flow`)),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-class-properties`)
    ),
    expect.stringContaining(
      path.join(`@babel`, `plugin-proposal-optional-chaining`)
    ),
    expect.stringContaining(path.join(`@babel`, `plugin-transform-runtime`)),
    expect.stringContaining(
      path.join(`@babel`, `plugin-syntax-dynamic-import`)
    ),
  ])
})
