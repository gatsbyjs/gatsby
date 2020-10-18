const loadPrismShowInvisibles = require(`../../plugins/prism-show-invisibles`)

describe(`prism-show-invisibles`, () => {
  test(`should export a function`, () => {
    expect(typeof loadPrismShowInvisibles).toBe(`function`)
  })

  test(`should not return`, () => {
    expect(loadPrismShowInvisibles()).toBeUndefined()
  })
})
