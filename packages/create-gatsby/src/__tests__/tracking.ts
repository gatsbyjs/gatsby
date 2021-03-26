let isTrackingEnabled: () => boolean

const get = jest.fn()
const set = jest.fn()

jest.doMock(`../utils/get-config-store`, () => {
  return {
    getConfigStore: (): unknown => {
      return {
        get,
        set,
      }
    },
  }
})

describe(`isTrackingEnabled`, () => {
  beforeEach(() => {
    jest.resetModules()
    isTrackingEnabled = require(`../tracking`).isTrackingEnabled
  })

  it(`is enabled by default`, () => {
    const enabled = isTrackingEnabled()
    expect(enabled).toBe(true)
  })

  it(`respects the setting of the config store`, () => {
    get.mockImplementationOnce(key => {
      if (key === `telemetry.enabled`) {
        return false
      } else {
        return true
      }
    })

    const enabled = isTrackingEnabled()
    expect(enabled).toBe(false)

    const cachedEnabled = isTrackingEnabled()
    expect(cachedEnabled).toBe(false)
  })

  describe(`process.env.GATSBY_TELEMETRY_DISABLED`, () => {
    beforeAll(() => {
      process.env.GATSBY_TELEMETRY_DISABLED = `true`
    })

    it(`respects the setting of the environment variable`, () => {
      const enabled = isTrackingEnabled()
      expect(enabled).toBe(false)

      const cachedEnabled = isTrackingEnabled()
      expect(cachedEnabled).toBe(false)
    })

    afterAll(() => {
      process.env.GATSBY_TELEMETRY_DISABLED = undefined
    })
  })
})
