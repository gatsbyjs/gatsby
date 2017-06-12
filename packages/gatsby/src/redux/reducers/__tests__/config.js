const reducer = require(`../config`)

describe(`config reducer`, () => {
  it(`let's you add a config`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {
        siteMetadata: {
          hi: true,
        },
      },
    }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it(`handles empty configs`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
    }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it(`It corrects pathPrefixes without a forward slash at beginning`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {
        pathPrefix: `prefix`,
      },
    }
    expect(reducer(undefined, action).pathPrefix).toBe(`/prefix`)
  })

  it(`It removes trailing forward slash`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {
        pathPrefix: `/prefix/`,
      },
    }
    expect(reducer(undefined, action).pathPrefix).toBe(`/prefix`)
  })
})
