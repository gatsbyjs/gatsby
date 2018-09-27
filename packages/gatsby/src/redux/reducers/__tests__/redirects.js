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

    expect(state).toEqual(
      [
        {
          fromPath: `/page1`,
          toPath: `/page1/`,
        },
      ]
    )
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

    expect(state).toEqual(
      [
        {
          fromPath: `/page1`,
          toPath: `https://example.com`,
        },
      ]
    )
  })

  it(`lets you redirect using any protocol`, () => {
    const action = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page1`,
        toPath: `https://example.com`,
      },
    }
    const action2 = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page2`,
        toPath: `http://example.com`,
      },
    }
    const action3 = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page3`,
        toPath: `//example.com`,
      },
    }
    const action4 = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page4`,
        toPath: `ftp://example.com`,
      },
    }
    const action5 = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page5`,
        toPath: `mailto:example@email.com`,
      },
    }
    const action6 = {
      type: `CREATE_REDIRECT`,
      payload: {
        fromPath: `/page6`,
        toPath: `/page6/`,
      },
    }

    let state = reducer(undefined, action)
    state = reducer(state, action2)
    state = reducer(state, action3)
    state = reducer(state, action4)
    state = reducer(state, action5)
    state = reducer(state, action6)

    expect(state).toEqual(
      [
        {
          fromPath: `/page1`,
          toPath: `https://example.com`,
        },
        {
          fromPath: `/page2`,
          toPath: `http://example.com`,
        },
        {
          fromPath: `/page3`,
          toPath: `//example.com`,
        },
        {
          fromPath: `/page4`,
          toPath: `ftp://example.com`,
        },
        {
          fromPath: `/page5`,
          toPath: `mailto:example@email.com`,
        },
        {
          fromPath: `/page6`,
          toPath: `/page6/`,
        },
      ]
    )
  })
})