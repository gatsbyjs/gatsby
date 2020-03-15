let reducer

describe(`redirects`, () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      reducer = require(`../redirects`)
    })
  })
  it(`lets you redirect to an internal url`, () => {
    const action = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page-internal`,
        toPath: `/page-internal/`,
      },
    }

    let state = reducer(undefined, action)

    expect(state).toEqual([
      {
        fromPath: `/page-internal`,
        toPath: `/page-internal/`,
      },
    ])
  })

  it(`lets you redirect to an external url`, () => {
    const action = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page-external`,
        toPath: `https://example.com`,
      },
    }

    let state = reducer(undefined, action)

    expect(state).toEqual([
      {
        fromPath: `/page-external`,
        toPath: `https://example.com`,
      },
    ])
  })

  const protocolArr = [
    [`https`, `https://example.com`],
    [`http`, `http://example.com`],
    [`//`, `//example.com`],
    [`ftp`, `ftp://example.com`],
    [`mailto`, `mailto:example@email.com`],
  ]

  protocolArr.forEach(([protocol, toPath], index) => {
    it(`lets you redirect using ${protocol}`, () => {
      const fromPath = `/page-protocol-${index}`
      const action = {
        type: `CREATE_REDIRECT`,
        payload: {
          fromPath,
          toPath,
        },
      }

      expect(reducer(undefined, action)).toEqual([
        {
          fromPath,
          toPath,
        },
      ])
    })
  })

  it(`prevents duplicate redirects`, () => {
    function createRedirect(fromPath, toPath) {
      return {
        type: `CREATE_REDIRECT`,
        payload: { fromPath, toPath },
      }
    }

    let state = reducer(undefined, createRedirect(`/page`, `/other-page`))
    state = reducer(state, createRedirect(`/page`, `/other-page`))

    expect(state).toEqual([
      {
        fromPath: `/page`,
        toPath: `/other-page`,
      },
    ])
  })

  it(`allows multiple redirects with same "fromPath" but different options`, () => {
    function createRedirect(redirect) {
      return {
        type: `CREATE_REDIRECT`,
        payload: redirect,
      }
    }

    let state = reducer(
      undefined,
      createRedirect({
        fromPath: `/page`,
        toPath: `/en/page`,
        Language: `en`,
      })
    )
    state = reducer(
      state,
      createRedirect({
        fromPath: `/page`,
        toPath: `/pt/page`,
        Language: `pt`,
      })
    )

    expect(state).toEqual([
      {
        fromPath: `/page`,
        toPath: `/en/page`,
        Language: `en`,
      },
      {
        fromPath: `/page`,
        toPath: `/pt/page`,
        Language: `pt`,
      },
    ])
  })
})
