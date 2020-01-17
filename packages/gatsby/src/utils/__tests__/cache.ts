import Cache from "../cache"
import fs from "fs-extra"
import manager from "cache-manager"

const mockErrorValue = jest.fn()
const mockResultValue = jest.fn()

jest.mock(`cache-manager`, () => {
  return {
    caching: jest.fn(),
    multiCaching: jest.fn(() => {
      return {
        get: jest.fn((_key, callback) => {
          callback(mockErrorValue(), mockResultValue())
        }),
        set: jest.fn((_key, _value, _args, callback) => {
          callback(mockErrorValue())
        }),
      }
    }),
  }
})
jest.mock(`fs-extra`, () => {
  return {
    ensureDirSync: jest.fn(),
  }
})

beforeEach(() => {
  ;(manager.caching as jest.Mock).mockReset()
  ;(fs.ensureDirSync as jest.Mock).mockReset()
})

const getCache = (options = { name: `__test__` }): Cache =>
  new Cache(options).init()

describe(`cache`, () => {
  it(`it can be instantiated`, () => {
    expect(() => new Cache()).not.toThrow()
  })

  it(`it can swap out cache store`, () => {
    const store = {
      custom: true,
      get: jest.fn(),
      set: jest.fn(),
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

      const containsThenMethod = (result): void =>
        expect(result).toEqual(
          expect.objectContaining({ then: expect.any(Function) })
        )

      containsThenMethod(cache.get(`a`))
      containsThenMethod(cache.set(`a`, `b`))
    })

    it(`throws if set is called without initting`, () => {
      const cache = new Cache({ name: `__test__` })
      return expect(cache.set(`a`, `b`)).rejects.toThrowError(
        `Cache wasn't initialised yet, please run the init method first`
      )
    })

    it(`throws if get is called without initting`, () => {
      const cache = new Cache({ name: `__test__` })
      return expect(cache.get(`a`)).rejects.toThrowError(
        `Cache wasn't initialised yet, please run the init method first`
      )
    })
  })

  describe(`set`, () => {
    it(`resolves to the value it cached`, () => {
      const cache = getCache()

      return expect(cache.set(`a`, `b`)).resolves.toBe(`b`)
    })

    it(`resolves to undefined on caching error`, () => {
      const cache = getCache()

      mockErrorValue.mockReturnValueOnce(true)

      return expect(cache.set(`a`, `b`)).resolves.toBeUndefined()
    })
  })

  describe(`get`, () => {
    it(`resolves to the found value`, () => {
      const cache = getCache()
      mockResultValue.mockReturnValueOnce(`result`)

      return expect(cache.get(``)).resolves.toBe(`result`)
    })

    it(`resolves to undefined on caching error`, () => {
      const cache = getCache()

      mockErrorValue.mockReturnValueOnce(true)

      return expect(cache.get(``)).resolves.toBeUndefined()
    })
  })
})
