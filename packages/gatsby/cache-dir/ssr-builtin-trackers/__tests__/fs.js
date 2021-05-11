const fs = require(`../fs`)

describe(`tracking fs`, () => {
  it(`doesn't crash on accessing fs.constants`, () => {
    expect(() => fs.constants).not.toThrow()
  })
})
