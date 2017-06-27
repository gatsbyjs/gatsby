const prepareRegex = require(`../prepare-regex`)

describe(`Prepare regex for Sift.js`, () => {
  it(`handles simple regex`, () => {
    expect(prepareRegex(`/blue/`)).toMatchSnapshot()
  })
  it(`handles flags regex`, () => {
    expect(prepareRegex(`/blue/i`)).toMatchSnapshot()
  })
  it(`handles slashes`, () => {
    expect(prepareRegex(`/bl\/ue/i`)).toMatchSnapshot()
  })
})
