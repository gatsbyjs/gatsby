import { murmurhash } from "../murmurhash"

describe(`murmurhash`, () => {
  it(`returns a hash for a string`, () => {
    expect(murmurhash(`foo`, 0)).toEqual(2414502773)
  })
  it(`returns same hash for same input string and seed`, () => {
    const result = murmurhash(`foo`, 0)
    expect(murmurhash(`foo`, 0)).toEqual(result)
  })
  it(`returns different hashes for same input string and different seed`, () => {
    const one = murmurhash(`foo`, 1)
    const two = murmurhash(`foo`, 2)
    expect(two).not.toEqual(one)
    expect(two).toEqual(1907694736)
  })
})
