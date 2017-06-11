const cache = require(`../cache`)
cache.initCache()

describe(`site cache`, () => {
  it(`can set and get cache items`, async () => {
    await cache.set(`a key`, `value`)
    await cache.set(`a boolean key`, true)
    const value = await cache.get(`a key`)
    const value2 = await cache.get(`a boolean key`)
    expect(value).toBe(`value`)
    expect(value2).toBe(true)
  })
})
