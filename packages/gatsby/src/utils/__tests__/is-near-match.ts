import { isNearMatch } from "../is-near-match"

describe(`isNearMatch`, () => {
  it(`should NOT find a near match if file name is undefined`, () => {
    const nearMatchA = isNearMatch(undefined, `gatsby-config`, 1)
    expect(nearMatchA).toBe(false)
  })

  it(`should calculate near matches based on distance`, () => {
    const nearMatchA = isNearMatch(`gatsby-config`, `gatsby-conf`, 2)
    const nearMatchB = isNearMatch(`gatsby-config`, `gatsby-configur`, 2)
    expect(nearMatchA).toBe(true)
    expect(nearMatchB).toBe(true)
  })
})
