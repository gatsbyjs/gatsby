const reducer = require(`../redirects`)

describe(`redirects`, () => {
  it(`lets you redirect to an internal url`, () => {
    const action = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page1`,
        toPath: `/page1/`,
      },
    }

    let state = reducer(undefined, action)

    expect(state).toEqual([
      {
        fromPath: `/page1`,
        toPath: `/page1/`,
      },
    ])
  })

  it(`lets you redirect to an external url`, () => {
    const action = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page1`,
        toPath: `https://example.com`,
      },
    }

    let state = reducer(undefined, action)

    expect(state).toEqual([
      {
        fromPath: `/page1`,
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
      const fromPath = `/page${index}`
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
