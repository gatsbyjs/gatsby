import { isLocalLink } from "../is-local-link"

describe(`isLocalLink`, () => {
  it(`returns true on relative link`, () => {
    expect(isLocalLink(`/docs/some-doc`)).toBe(true)
  })
  it(`returns false on absolute link`, () => {
    expect(isLocalLink(`https://www.gatsbyjs.com`)).toBe(false)
  })
  it(`throws TypeError if input is undefined`, () => {
    expect(() => isLocalLink(undefined)).toThrowError(
      `Expected a \`string\`, got \`undefined\``
    )
  })
  it(`throws TypeError if input is not a string`, () => {
    expect(() => isLocalLink(-1)).toThrowError(
      `Expected a \`string\`, got \`number\``
    )
  })
})
