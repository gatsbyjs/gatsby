jest.mock(`browserslist/node`, () => ({
  findConfig: jest.fn(),
}))
const path = require(`path`)
const getBrowsersList = require(`../browserslist`)
const { findConfig: mockedFindConfig } = require(`browserslist/node`)

const BASE = path.resolve(`.`)

describe(`browserslist`, () => {
  it(`prefers returned browserslist results`, () => {
    const defaults = ["IE 11"]
    mockedFindConfig.mockReturnValueOnce({
      defaults,
    })

    const list = getBrowsersList(BASE)

    expect(list).toEqual(defaults)
  })

  it(`falls back to defaults`, () => {
    const fallback = ["> 0.25%"]
    mockedFindConfig.mockReturnValueOnce(undefined)

    const list = getBrowsersList(BASE, fallback)

    expect(list).toEqual(fallback)
  })
})
