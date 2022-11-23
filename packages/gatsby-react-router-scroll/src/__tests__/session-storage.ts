/**
 * @jest-environment jsdom
 */

import { parsePath, Path } from "history"
import { SessionStorage } from "../session-storage"

describe(`SessionStorage`, () => {
  it(`Handles different scroll positions on pages with key of \`initial\``, () => {
    const inst = new SessionStorage()
    const key = `initial`
    const fooLocation = parsePath(`/foo`)
    const barLocation = parsePath(`/bar`)
    inst.save(
      {
        ...fooLocation,
        hash: ``,
        search: ``,
      } as Path,
      key,
      100
    )
    inst.save(
      {
        ...barLocation,
        hash: ``,
        search: ``,
      } as Path,
      key,
      0
    )
    expect(inst.read(fooLocation as Path, key)).toBe(100)
    expect(inst.read(barLocation as Path, key)).toBe(0)
  })
})
