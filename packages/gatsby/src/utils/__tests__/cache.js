jest.mock(`cache-manager`, () => {
  return {
    caching: jest.fn(),
    multiCaching: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        set: jest.fn(),
      }
    }),
  }
})
jest.mock(`fs-extra`, () => {
  return {
    ensureDirSync: jest.fn(),
  }
})
const Cache = require(`../cache`)
const fs = require(`fs-extra`)
const manager = require(`cache-manager`)

beforeEach(() => {
  manager.caching.mockReset()
  fs.ensureDirSync.mockReset()
})

const getCache = (options = { name: `__test__` }) => new Cache(options).init()

describe(`cache`, () => {
  it(`it can be instantiated`, () => {
    expect(() => new Cache()).not.toThrow()
  })

  it(`it can swap out cache store`, () => {
    const store = {
      custom: true,
    }

    new Cache({
      store,
    }).init()

    expect(manager.caching).toHaveBeenLastCalledWith(
      expect.objectContaining({
        store,
      })
    )
  })

  it(`it does not set up cache on instantiation`, () => {
    expect(manager.caching).not.toHaveBeenCalled()
  })

  it(`uses MAX_SAFE_INTEGER as TTL`, () => {
    getCache()

    expect(manager.caching).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          ttl: Number.MAX_SAFE_INTEGER,
        }),
      })
    )
  })

  describe(`init`, () => {
    it(`it contains an init method`, () => {
      const cache = getCache()
      expect(cache.init).toEqual(expect.any(Function))
    })

    it(`it calls ensureDirSync`, () => {
      const name = `__TEST_CACHE_NAME__`
      getCache({ name })

      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        expect.stringContaining(name)
      )
    })

    it(`it returns cache instance with get/set methods`, () => {
      const cache = getCache()

      expect(cache.get).toEqual(expect.any(Function))
      expect(cache.set).toEqual(expect.any(Function))
    })
  })

  describe(`get/set`, () => {
    it(`both are promises`, () => {
      const cache = getCache()

      const containsThenMethod = result =>
        expect(result).toEqual(
          expect.objectContaining({ then: expect.any(Function) })
        )

      containsThenMethod(cache.get(`a`))
      containsThenMethod(cache.set(`a`, `b`))
    })
  })
})
