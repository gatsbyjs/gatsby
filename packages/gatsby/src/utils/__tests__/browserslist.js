jest.mock(`browserslist/node`, () => {
  return {
    findConfig: jest.fn(),
  }
})
const path = require(`path`)
import { getBrowsersList } from "../browserslist"
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
})
