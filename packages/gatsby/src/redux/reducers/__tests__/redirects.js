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
})
