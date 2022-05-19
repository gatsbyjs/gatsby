jest.mock(`browserslist/node`, () => {
  const original = jest.requireActual(`browserslist/node`)
  return {
    ...original,
    findConfig: jest.fn(),
  }
})
const path = require(`path`)
import {
  getBrowsersList,
  hasES6ModuleSupport,
  hasIESupport,
} from "../browserslist"
const { findConfig: mockedFindConfig } = require(`browserslist/node`)

const BASE = path.resolve(`.`)

describe(`browserslist`, () => {
  it(`prefers returned browserslist results`, () => {
    const defaults = [`IE 11`]
    mockedFindConfig.mockReturnValueOnce({
      defaults,
    })

    const list = getBrowsersList(BASE)

    expect(list).toEqual(defaults)
  })

  it(`falls back to defaults`, () => {
    mockedFindConfig.mockReturnValueOnce(undefined)

    const list = getBrowsersList(BASE)

    expect(list).toEqual([`>0.25%`, `not dead`])
  })

  it(`hasES6ModuleSupport returns true if all browsers support es6 modules`, () => {
    const defaults = [`chrome 90`]
    mockedFindConfig.mockReturnValueOnce({
      defaults,
    })

    expect(hasES6ModuleSupport(BASE)).toBe(true)
  })

  it(`hasES6ModuleSupport returns false if any browser does not support es6 modules`, () => {
    const defaults = [`IE 11`]
    mockedFindConfig.mockReturnValueOnce({
      defaults,
    })
    getBrowsersList(BASE)

    expect(hasES6ModuleSupport(BASE)).toBe(false)

    // eslint-disable-next-line
  }); // ; is needed here for IDEs to be happy with the array below

  // eslint-disable-next-line
  [
    { defaults: [`last 2 versions, not ie 6-11`], expected: false },
    { defaults: [`last 2 chrome versions`], expected: false },
    { defaults: [`last 2 versions`], expected: true },
  ].forEach(({ defaults, expected }) => {
    it.only(`hasIESupport returns ${expected} when browser list is "${defaults}"`, () => {
      mockedFindConfig.mockReturnValueOnce({ defaults })

      const actual = hasIESupport(BASE)

      expect(actual).toBe(expected)
    })
  })
})
