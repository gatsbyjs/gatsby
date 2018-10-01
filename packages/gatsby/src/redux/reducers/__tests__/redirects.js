const createRedirects = require(`../redirects`);

const createAction = payload => ({
  type: `CREATE_REDIRECT`,
  payload
})

describe(`redirects`, () => {
  it(`passes through non-redirect action types`, () => {
    let state = []

    createRedirects(state, {
      type: `__SAMPLE_DO_NOT_PASS_THROUGH__`,
      payload: [ { test: true }]
    });

    expect(state).toEqual([]);
  })

  it(`merges one item array`, () => {
    let state = []

    const redirect = { fromPath: `/blog/sample.html`, toPath: `/blog/other.html` }

    state = createRedirects(state, createAction([
      redirect
    ]));

    expect(state).toEqual([
      redirect
    ])
  })

  it(`merges two item array`, () => {
    let state = []

    const redirects = [ { fromPath: `/blog`, toPath: `/blog/sample.html` }, { fromPath:`/blog`, toPath: `/blog/sample.html`}]

    state = createRedirects(state, createAction(redirects))

    expect(state).toEqual(redirects)
  })

  it(`skips items that already exist in state`, () => {
    const redirect = { fromPath: `/blog/other.html`, toPath: `/blog/sample.html` }
    let state = [redirect]

    const existingStateLength = state.length;

    state = createRedirects(state, createAction([redirect]))

    expect(state).toHaveLength(existingStateLength)
  })
})
