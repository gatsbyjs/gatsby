const reducer = require(`../config`)

describe(`config reducer`, () => {
  beforeEach(() => {
    jest.resetModules()
  })

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

  it(`Validates configs with unsupported options`, () => {
    const config = {
      someRandomThing: `hi people`,
      plugins: [],
    }
    function runReducer() {
      return reducer(
        {},
        {
          type: `SET_SITE_CONFIG`,
          payload: config,
        }
      )
    }
    expect(runReducer).toThrowErrorMatchingSnapshot()
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

  it(`It removes pathPrefixes that are a single forward slash`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {
        pathPrefix: `/`,
      },
    }
    expect(reducer(undefined, action).pathPrefix).toBe(``)
  })

  it(`It sets the pathPrefix to an empty string if it's not set`, () => {
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {},
    }
    expect(reducer(undefined, action).pathPrefix).toBe(``)
  })

  it(`throws with a suggestion when an invalid key is passed`, async () => {
    const consoleSpy = jest.spyOn(console, `log`).mockImplementation(() => {})

    expect.assertions(1)
    const action = {
      type: `SET_SITE_CONFIG`,
      payload: {
        plugin: [],
      },
    }

    try {
      reducer({}, action)
    } catch (err) {
      expect(consoleSpy.mock.calls[1][0]).toContain(`Did you mean "plugins"?`)
    }
  })
})
