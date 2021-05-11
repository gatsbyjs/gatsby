const loadPrismAutoLinker = require(`../../plugins/prism-autolinker`)

describe(`prism-autolinker`, () => {
  test(`should export a function`, () => {
    expect(typeof loadPrismAutoLinker).toBe(`function`)
  })

  test(`should not return`, () => {
    expect(loadPrismAutoLinker()).toBeUndefined()
  })
})
