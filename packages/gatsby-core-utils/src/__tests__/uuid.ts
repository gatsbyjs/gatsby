/**
 * Copied from https://github.com/lukeed/uuid
 * https://github.com/lukeed/uuid/blob/master/test/index.js
 */
import isUUID from "is-uuid"
import { v4 as uuid } from "../uuid"

describe(`uuid`, () => {
  it(`returns`, () => {
    const out = uuid()
    expect(out).toHaveLength(36)
    expect(typeof out).toBe(`string`)
  })

  it(`unique`, () => {
    const length = 1e6
    expect(uuid()).not.toBe(uuid())

    const unique = new Set(Array.from({ length }, uuid))
    expect(unique.size).toBe(length)
  })

  it(`validate`, () => {
    const arr = Array.from({ length: 1e3 }, uuid)
    expect(arr.map(item => isUUID.v4(item)).filter(Boolean)).toHaveLength(1e3)
  })
})
