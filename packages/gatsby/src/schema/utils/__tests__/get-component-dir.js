const getComponentDir = require(`../get-component-dir`)

describe(`getComponentDir util`, () => {
  it(`returns component dir when in a StaticQuery component`, () => {
    const source = { componentPath: `/home/me/gatsby/components/component.js` }
    const componentDir = getComponentDir(source)
    const expected = `/home/me/gatsby/components`
    expect(componentDir).toBe(expected)
  })

  it(`returns component dir when in a page query`, () => {
    const source = { componentPath: `/home/me/gatsby/pages/page.js` }
    const componentDir = getComponentDir(source)
    const expected = `/home/me/gatsby/pages`
    expect(componentDir).toBe(expected)
  })

  it(`returns undefined when no source provided`, () => {
    const source = null
    const componentDir = getComponentDir(source)
    expect(componentDir).toBeNull()
  })
})
