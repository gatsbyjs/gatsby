const preset = require(`../`)
const path = require(`path`)

expect.addSnapshotSerializer(require(`../utils/path-serializer`))

describe(`babel-preset-gatsby`, () => {
  it.each([`build-stage`, `develop`, `build-javascript`, `build-html`])(
    `should specify proper presets and plugins when stage is %s`,
    stage => {
      expect(preset(null, { stage })).toMatchSnapshot()
    }
  )

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
})
