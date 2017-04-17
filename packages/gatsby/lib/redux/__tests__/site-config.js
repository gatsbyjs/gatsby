import reducer from "../reducers/config"

describe(`add site config`, () => {
  it(`allow you to add basic site config`, () => {
    const config = {
      siteMetadata: {
        title: "yo testing",
      },
      plugins: [],
    }
    const state = reducer(
      {},
      {
        type: "SET_SITE_CONFIG",
        payload: config,
      }
    )
    expect(state).toMatchSnapshot()
  })

  it(`should have default rootPath`, () => {
    const config = {
      siteMetadata: {
        title: "yo testing",
      },
      plugins: [],
    }
    const state = reducer(
      {},
      {
        type: "SET_SITE_CONFIG",
        payload: config,
      }
    )
    expect(state.rootPath).toEqual(`/`)
  })

  it(`should override default rootPath`, () => {
    const config = {
      rootPath: `/src/`,
      siteMetadata: {
        title: "yo testing",
      },
      plugins: [],
    }
    const state = reducer(
      {},
      {
        type: "SET_SITE_CONFIG",
        payload: config,
      }
    )
    expect(state.rootPath).toEqual(`/src/`)
  })

  it(`Validates configs with unsupported options`, () => {
    const config = {
      someRandomThing: "hi people",
      plugins: [],
    }
    function runReducer() {
      return reducer(
        {},
        {
          type: "SET_SITE_CONFIG",
          payload: config,
        }
      )
    }
    expect(runReducer).toThrowErrorMatchingSnapshot()
  })
})
