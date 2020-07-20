import { createLocation } from "history"
import { SessionStorage } from "../session-storage"

describe(`SessionStorage`, () => {
  it(`Handles different scroll positions on pages with key of \`initial\``, () => {
    const inst = new SessionStorage()
    const key = `initial`
    const fooLocation = createLocation(`/foo`, {}, key)
    const barLocation = createLocation(`/bar`, {}, key)
    inst.save(fooLocation, key, 100)
    inst.save(barLocation, key, 0)
    expect(inst.read(fooLocation, key)).toBe(100)
    expect(inst.read(barLocation, key)).toBe(0)
  })
})
