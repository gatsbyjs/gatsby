const getAPI = setup => {
  if (setup) {
    setup()
  }

  jest.resetModules()

  return require(`../gatsby-browser`)
}

beforeEach(() => {
  window.dataLayer = []
  jest.useFakeTimers()
  process.env.NODE_ENV = undefined
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
})
