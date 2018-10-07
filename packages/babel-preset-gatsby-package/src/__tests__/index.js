const preset = require(`../`)

it(`Specifies proper presets and plugins in Node mode`, () => {
  const { presets, plugins } = preset()

  expect(presets).toEqual([
    [
      expect.stringContaining(`@babel/preset-env`),
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
    [expect.stringContaining(`@babel/preset-react`), { development: true }],
    expect.stringContaining(`@babel/preset-flow`),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(`@babel/plugin-proposal-class-properties`),
    expect.stringContaining(`@babel/plugin-proposal-optional-chaining`),
    expect.stringContaining(`@babel/plugin-transform-runtime`),
  ])
})

it(`Specifies proper presets and plugins in debug Node mode`, () => {
  const { presets, plugins } = preset(null, { debug: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(`@babel/preset-env`),
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
    [expect.stringContaining(`@babel/preset-react`), { development: true }],
    expect.stringContaining(`@babel/preset-flow`),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(`@babel/plugin-proposal-class-properties`),
    expect.stringContaining(`@babel/plugin-proposal-optional-chaining`),
    expect.stringContaining(`@babel/plugin-transform-runtime`),
  ])
})

it(`Specifies proper presets and plugins in browser mode`, () => {
  const { presets, plugins } = preset(null, { browser: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(`@babel/preset-env`),
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
    [expect.stringContaining(`@babel/preset-react`), { development: true }],
    expect.stringContaining(`@babel/preset-flow`),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(`@babel/plugin-proposal-class-properties`),
    expect.stringContaining(`@babel/plugin-proposal-optional-chaining`),
    expect.stringContaining(`@babel/plugin-transform-runtime`),
  ])
})

it(`Specifies proper presets and plugins in debug browser mode`, () => {
  const { presets, plugins } = preset(null, { browser: true, debug: true })

  expect(presets).toEqual([
    [
      expect.stringContaining(`@babel/preset-env`),
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
    [expect.stringContaining(`@babel/preset-react`), { development: true }],
    expect.stringContaining(`@babel/preset-flow`),
  ])
  expect(plugins).toEqual([
    expect.stringContaining(`@babel/plugin-proposal-class-properties`),
    expect.stringContaining(`@babel/plugin-proposal-optional-chaining`),
    expect.stringContaining(`@babel/plugin-transform-runtime`),
  ])
})
