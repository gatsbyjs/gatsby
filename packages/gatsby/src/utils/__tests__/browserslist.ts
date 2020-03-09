import path from "path"

jest.mock(`browserslist/node`, () => ({
  findConfig: jest.fn(),
}))
import { findConfig as mockedFindConfig } from "browserslist/node"

import { getBrowsersList } from "../browserslist"

const BASE = path.resolve(`.`)

describe(`browserslist`, () => {
  it(`prefers returned browserslist results`, () => {
    const defaults = [`IE 11`]
    mockedFindConfig.mockReturnValueOnce({ defaults })

    const list = getBrowsersList(BASE)

    expect(list).toEqual(defaults)
  })

  it(`falls back to defaults`, () => {
    mockedFindConfig.mockReturnValueOnce(undefined)

    const list = getBrowsersList(BASE)

    expect(list).toEqual([`>0.25%`, `not dead`])
  })
})
