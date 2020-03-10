import { is32BitInteger } from "../is-32-bit-integer"

const MAX_INT = 2147483647
const MIN_INT = -2147483648

describe(`is32BitInteger`, () => {
  it(`works with all kind of values`, () => {
    expect(is32BitInteger(MAX_INT)).toBe(true)
    expect(is32BitInteger(MIN_INT)).toBe(true)
    expect(is32BitInteger(MAX_INT + 1)).toBe(false)
    expect(is32BitInteger(MIN_INT - 1)).toBe(false)
    expect(is32BitInteger(2.4)).toBe(false)
    expect(is32BitInteger(`42`)).toBe(false)
    expect(is32BitInteger({})).toBe(false)
    expect(is32BitInteger([1])).toBe(false)
    expect(is32BitInteger(true)).toBe(false)
    expect(is32BitInteger(false)).toBe(false)
    expect(is32BitInteger(undefined)).toBe(false)
    expect(is32BitInteger(null)).toBe(false)
  })
})
