const createRedirects = require(`../redirects`)

const createAction = payload => {return {
  type: `CREATE_REDIRECT`,
  payload,
}}

describe(`redirects`, () => {
  it(`passes through non-redirect action types`, () => {
    const state = createRedirects([], {
      type: `__SAMPLE_DO_NOT_PASS_THROUGH__`,
      payload: { test: true },
    })

    expect(state).toEqual([])
  })

  it(`does not mutate array`, () => {
    const state = [{ test: true }]

    const newState = createRedirects(state, createAction({
      fromPath: `/blog`,
      toPath: `/docs`,
    }))

    expect(state).not.toEqual(newState)
  })

  it(`skips redirect, if already added`, () => {
    const redirect = { fromPath: `/blog/sample.html`, toPath: `/docs/other.html` }
    let state = [redirect]

    state = createRedirects(state, createAction(redirect))

    expect(state).toHaveLength(1)
  })

  it(`skips root domain`, () => {
    const redirect = { fromPath: `/`, toPath: `/docs` }

    const state = createRedirects([], createAction(redirect))

    expect(state).toHaveLength(1)
    expect(state).toEqual([expect.objectContaining(redirect)])
  })

  it(`adds file redirects, as is`, () => {
    const redirect = {
      fromPath: `/blog/sample.html`,
      toPath: `/blog/other.html`,
    }

    const state = createRedirects([], createAction(redirect))

    expect(state).toHaveLength(1)
    expect(state).toEqual([expect.objectContaining(redirect)])
  })

  it(`adds slash to folder redirect`, () => {
    const redirect = {
      fromPath: `/blog`,
      toPath: `/blog/sample.html`,
    }

    const state = createRedirects([], createAction(redirect))

    expect(state).toHaveLength(2)
    expect(state).toEqual([
      expect.objectContaining(redirect),
      expect.objectContaining({
        ...redirect,
        fromPath: `${redirect.fromPath}/`,
      }),
    ])
  })

  it(`adds slash to multiple folder redirects`, () => {
    const redirect = {
      fromPath: `/blog`,
      toPath: `/docs`,
    }

    const state = createRedirects([], createAction(redirect))

    expect(state).toEqual([
      expect.objectContaining(redirect),
      expect.objectContaining({
        fromPath: `/blog/`,
      }),
    ])
  })

  describe(`external URLs`, () => {
    it(`lets you redirect to an internal url`, () => {
      const redirect = {
        fromPath: `/page1/sample.html`,
        toPath: `/page1`,
      }
      const state = createRedirects([], createAction(redirect))
  
      expect(state).toEqual(
        [
          redirect,
        ]
      )
    })
  
    it(`lets you redirect to an external url`, () => {
      const redirect = {
        fromPath: `/page1`,
        toPath: `https://example.com`,
      }
  
      const state = createRedirects([], createAction(redirect))
  
      expect(state).toEqual(
        [
          redirect,
          {
            ...redirect,
            fromPath: `${redirect.fromPath}/`,
          },
        ]
      )
    })
  
    ;[
      [`https`, `https://example.com`],
      [`http`, `http://example.com`],
      [`//`, `//example.com`],
      [`ftp`, `ftp://example.com`],
      [`mailto`, `mailto:example@email.com`],
    ].forEach(([protocol, toPath], index) => {
      it(`lets you redirect using ${protocol}`, () => {
        const fromPath = `/page${index}`
        const redirect = {
          fromPath,
          toPath,
        }
  
        expect(createRedirects([], createAction(redirect))).toEqual([
          redirect,
          {
            ...redirect,
            fromPath: `${fromPath}/`,
          },
        ])
      })
    })
  })
})