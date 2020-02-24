const loadPrismShowInvisibles = require(`../../plugins/prism-show-invisibles`)

// https://artsy.github.io/blog/2018/08/24/How-to-debug-jest-tests/
// yarn jest:inspect ./gatsby/packages/gatsby-remark-prismjs/src/__tests__/plugins/prism-show-invisibles.js
// yarn jest ./gatsby/packages/gatsby-remark-prismjs/src/__tests__/plugins/prism-show-invisibles.js
describe(`prism-show-invisibles`, () => {
  test(`should export a function`, () => {
    console.log(`here it comes:`, typeof loadPrismShowInvisibles)
    expect(typeof loadPrismShowInvisibles).toBe(`function`)
  })

  test(`should not return`, () => {
    expect(loadPrismShowInvisibles()).toBeUndefined()
  })

  test(`should return when global is undefined`, () => {
    // eslint-disable-next-line no-global-assign
    global = undefined
    expect(loadPrismShowInvisibles()).toBeNull()
  })

  test(`should not be a mock`, () => {
    expect(loadPrismShowInvisibles._isMockFunction).toBeFalsy()
  })

  test(`plays video`, () => {
    const spy = jest.spyOn(loadPrismShowInvisibles, `addInvisibles`)
    const isPlaying = loadPrismShowInvisibles.addInvisibles()

    expect(spy).toHaveBeenCalled()
    expect(isPlaying).toBe(true)

    spy.mockRestore()
  })

  // TODO:
  // [] See what I can test
  // [] Test it!
  // [] Debug Jest
  // [] Export functionality?
  // [] See how the other Prism plugins use Jest
  // [] Jest spy
  // [] Jest inject mock on spy
})
