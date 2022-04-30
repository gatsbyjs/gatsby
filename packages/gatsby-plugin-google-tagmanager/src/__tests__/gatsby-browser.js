/**
 * @jest-environment jsdom
 */

import { getLCP, getFID, getCLS } from "web-vitals/base"

jest.mock(`web-vitals/base`, () => {
  function createEntry(type, id, value) {
    return { name: type, id, value }
  }

  return {
    getLCP: jest.fn(report => {
      report(createEntry(`LCP`, `1`, `300`))
    }),
    getFID: jest.fn(report => {
      report(createEntry(`FID`, `2`, `150`))
    }),
    getCLS: jest.fn(report => {
      report(createEntry(`CLS`, `3`, `0.10`))
    }),
  }
})

const getAPI = setup => {
  if (setup) {
    setup()
  }

  jest.resetModules()

  return require(`../gatsby-browser`)
}

let currentNodeEnv
beforeEach(() => {
  currentNodeEnv = process.env.NODE_ENV
  window.dataLayer = []
  jest.useFakeTimers()
  process.env.NODE_ENV = undefined
})

afterEach(() => {
  jest.useRealTimers()
  process.env.NODE_ENV = currentNodeEnv
})

describe(`onRouteUpdate`, () => {
  it(`does not register if NODE_ENV is not production`, () => {
    const { onRouteUpdate } = getAPI(() => {
      process.env.NODE_ENV = `development`
    })

    onRouteUpdate({}, {})

    jest.runAllTimers()

    expect(window.dataLayer).toHaveLength(0)
  })

  it(`registers a route change event`, () => {
    const { onRouteUpdate } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })

    onRouteUpdate({}, {})

    jest.runAllTimers()

    expect(window.dataLayer).toEqual([
      {
        event: `gatsby-route-change`,
      },
    ])
  })

  it(`registers if NODE_ENV is production`, () => {
    const { onRouteUpdate } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })

    onRouteUpdate({}, {})

    jest.runAllTimers()

    expect(window.dataLayer).toHaveLength(1)
  })

  it(`registers if includeInDevelopment is true`, () => {
    const { onRouteUpdate } = getAPI(() => {})

    onRouteUpdate(
      {},
      {
        includeInDevelopment: true,
      }
    )

    jest.runAllTimers()

    expect(window.dataLayer).toHaveLength(1)
  })

  it(`registers a custom route change event name if given in routeChangeEventName`, () => {
    const { onRouteUpdate } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })
    const customEventName = `custom-route-change-event-name`

    onRouteUpdate(
      {},
      {
        routeChangeEventName: customEventName,
      }
    )

    jest.runAllTimers()

    expect(window.dataLayer).toEqual([
      {
        event: customEventName,
      },
    ])
  })

  it(`registers new data layer variable if dataLayerName is specified`, () => {
    const { onRouteUpdate } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })
    const dataLayerName = `fooBarDataLater`
    window[dataLayerName] = []

    onRouteUpdate(
      {},
      {
        dataLayerName,
      }
    )

    jest.runAllTimers()

    expect(window[dataLayerName]).toHaveLength(1)
  })

  it(`sends core web vitals when enabled`, async () => {
    const { onInitialClientRender } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })
    onInitialClientRender({}, { enableWebVitalsTracking: true })

    // wait 2 ticks to wait for dynamic import to resolve
    await Promise.resolve()
    await Promise.resolve()

    jest.runAllTimers()

    expect(window.dataLayer.length).toBe(3)
    expect(window.dataLayer).toContainEqual({
      event: `core-web-vitals`,
      webVitalsMeasurement: {
        name: `LCP`,
        id: `1`,
        value: 300,
      },
    })
    expect(window.dataLayer).toContainEqual({
      event: `core-web-vitals`,
      webVitalsMeasurement: {
        name: `FID`,
        id: `2`,
        value: 150,
      },
    })
    expect(window.dataLayer).toContainEqual({
      event: `core-web-vitals`,
      webVitalsMeasurement: {
        name: `CLS`,
        id: `3`,
        value: 100,
      },
    })
  })

  it(`sends nothing when web vitals tracking is disabled`, async () => {
    const { onInitialClientRender } = getAPI(() => {
      process.env.NODE_ENV = `production`
    })
    onInitialClientRender({}, { enableWebVitalsTracking: false })

    // wait 2 ticks to wait for dynamic import to resolve
    await Promise.resolve()
    await Promise.resolve()

    jest.runAllTimers()

    expect(getLCP).not.toBeCalled()
    expect(getFID).not.toBeCalled()
    expect(getCLS).not.toBeCalled()
  })
})
