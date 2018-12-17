const pageDependencyResolver = require(`../page-dependency-resolver`)

describe(`page-dependency-resolver`, () => {
  it(`should handle nulls in results`, async () => {
    const innerResolver = () => [null]
    const resolver = pageDependencyResolver(innerResolver)
    const result = await resolver({}, {})
    expect(result).toEqual([null])
  })
})
