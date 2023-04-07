jest.mock(`browserslist/node`, () => {
  const original = jest.requireActual(`browserslist/node`)
  return {
    ...original,
    loadConfig: jest.fn(),
  }
})
const path = require(`path`)
import { getBrowsersList, hasES6ModuleSupport } from "../browserslist"
const { loadConfig: mockedLoadConfig } = require(`browserslist/node`)

const BASE = path.resolve(`.`)

const itWhenV4 = _CFLAGS_.GATSBY_MAJOR !== `5` ? it : it.skip

describe(`browserslist`, () => {
  it(`prefers returned browserslist results`, () => {
    const defaults = [`IE 11`]
    mockedLoadConfig.mockReturnValueOnce(defaults)

    const list = getBrowsersList(BASE)

    expect(list).toEqual(defaults)
  })

  it(`falls back to defaults`, () => {
    mockedLoadConfig.mockReturnValueOnce(undefined)

    const list = getBrowsersList(BASE)

    if (_CFLAGS_.GATSBY_MAJOR === `5`) {
      expect(list).toEqual([
        `>0.25% and supports es6-module`,
        `not dead and supports es6-module`,
      ])
    } else {
      expect(list).toEqual([`>0.25%`, `not dead`])
    }
  })

  it(`hasES6ModuleSupport returns true if all browsers support es6 modules`, () => {
    const defaults = [`chrome 90`]
    mockedLoadConfig.mockReturnValueOnce(defaults)

    expect(hasES6ModuleSupport(BASE)).toBe(true)
  })

  itWhenV4(
    `hasES6ModuleSupport returns false if any browser does not support es6 modules`,
    () => {
      const defaults = [`IE 11`]
      mockedLoadConfig.mockReturnValueOnce(defaults)
      getBrowsersList(BASE)

      expect(hasES6ModuleSupport(BASE)).toBe(false)
    }
  )
})
