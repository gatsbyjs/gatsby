const createRedirects = require(`../redirects`)

const createAction = payload => {return {
  type: `CREATE_REDIRECT`,
  payload,
}}

describe(`redirects`, () => {
  it(`passes through non-redirect action types`, () => {
    let state = []

    state = createRedirects(state, {
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

  it(`adds file redirects, as is`, () => {
    let state = []

    const redirect = {
      fromPath: `/blog/sample.html`,
      toPath: `/blog/other.html`,
    }

    state = createRedirects(state, createAction(redirect))

    expect(state).toHaveLength(1)
    expect(state).toEqual([expect.objectContaining(redirect)])
  })

  it(`adds slash to folder redirect`, () => {
    let state = []

    const redirect = {
      fromPath: `/blog`,
      toPath: `/blog/sample.html`,
    }

    state = createRedirects(state, createAction(redirect))

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
    let state = []

    const redirect = {
      fromPath: `/blog`,
      toPath: `/docs`,
    }

    state = createRedirects(state, createAction(redirect))

    expect(state).toEqual([
      expect.objectContaining(redirect),
      {
        fromPath: `/blog/`,
        toPath: `/docs/`,
      },
    ])
  })
})
