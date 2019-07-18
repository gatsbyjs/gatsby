import normalize from "../normalize"

describe(`stripping of comments`, () => {
  it(`strips highlight-line`, () => {
    expect(normalize(``)).toEqual([``, {}])
  })
})
