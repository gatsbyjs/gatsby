const preset = require(`../`)

const noopResolve = m => `<node_modules>/${m}/index.js`

describe(`babel-preset-gatsby`, () => {
  it.each([`build-stage`, `develop`, `build-javascript`, `build-html`])(
    `should specify proper presets and plugins when stage is %s`,
    stage => {
      expect(preset(null, { stage }, noopResolve)).toMatchSnapshot()
    }
  )

  it(`Allows to configure browser targets`, () => {
    const targets = `last 1 version`
    const { presets } = preset(
      null,
      {
        stage: `build-javascript`,
        targets,
      },
      noopResolve
    )

    expect(presets[0]).toEqual([
      `<node_modules>/@babel/preset-env/index.js`,
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
})
