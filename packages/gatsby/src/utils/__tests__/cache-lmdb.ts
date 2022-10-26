const complexObject = {
  key: `value`,
  another_key: 2,
  nested: { hello: `world`, foo: `bar`, nested: { super: `duper` } },
}

describe(`cache-lmdb`, () => {
  let cache

  beforeAll(async () => {
    const { default: GatsbyCacheLmdb, resetCache } = await import(
      `../cache-lmdb`
    )

    await resetCache()
    cache = new GatsbyCacheLmdb({ name: `__test__` }).init()
  })

  it(`it can be instantiated`, () => {
    if (!cache) fail(`cache not instantiated`)
  })
  it(`returns cache instance with get/set methods`, () => {
    expect(cache.get).toEqual(expect.any(Function))
    expect(cache.set).toEqual(expect.any(Function))
  })
  describe(`set`, () => {
    it(`resolves to the value it cached (string)`, () =>
      expect(cache.set(`string`, `I'm a simple string`)).resolves.toBe(
        `I'm a simple string`
      ))
    it(`resolves to the value it cached (object)`, () =>
      expect(cache.set(`object`, complexObject)).resolves.toStrictEqual(
        complexObject
      ))
  })
  describe(`get`, () => {
    it(`resolves to the found value (string)`, () =>
      expect(cache.get(`string`)).resolves.toBe(`I'm a simple string`))
    it(`resolves to the found value (object)`, () =>
      expect(cache.get(`object`)).resolves.toStrictEqual(complexObject))
  })
})
