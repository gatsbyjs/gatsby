import reducer from "../reducers/config"

describe(`add site config`, () => {
  it(`allow you to add basic site config`, () => {
    const config = {
      siteMetadata: {
        title: `yo testing`,
      },
      plugins: [],
    }
    const state = reducer(
      {},
      {
        type: `SET_SITE_CONFIG`,
        payload: config,
      }
    )
    expect(state).toMatchSnapshot()
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
})
