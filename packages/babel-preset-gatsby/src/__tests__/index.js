import * as path from "path"
import preset from "../index"
import * as pathSerializer from "../utils/path-serializer"

expect.addSnapshotSerializer(pathSerializer)

describe(`babel-preset-gatsby`, () => {
  let currentEnv
  beforeEach(() => {
    currentEnv = process.env.BABEL_ENV
    process.env.BABEL_ENV = `production`
  })

  afterEach(() => {
    process.env.BABEL_ENV = currentEnv
  })

  it.each([`develop-html`, `develop`, `build-javascript`, `build-html`])(
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
      expect.objectContaining({
        targets,
      }),
    ])
  })

  it(`Allows to configure react runtime`, () => {
    const { presets } = preset(null, {
      reactRuntime: `automatic`,
    })

    expect(presets[1]).toEqual([
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      expect.objectContaining({
        pragma: undefined,
        runtime: `automatic`,
      }),
    ])
  })

  it(`Allows to configure react importSource`, () => {
    const { presets } = preset(null, {
      reactImportSource: `@emotion/react`,
      reactRuntime: `automatic`,
    })

    expect(presets[1]).toEqual([
      expect.stringContaining(path.join(`@babel`, `preset-react`)),
      expect.objectContaining({
        importSource: `@emotion/react`,
      }),
    ])
  })

  it(`Fails to configure react importSource if source is classic`, () => {
    expect(() => preset(null, { reactImportSource: `@emotion/react` })).toThrow(
      `@babel/preset-react\` requires reactRuntime \`automatic\` in order to use \`importSource\`.`
    )
  })
})
