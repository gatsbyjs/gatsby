import { setRequestHeadersReducer as reducer } from "../reducers/set-request-headers"
import { actions } from "../actions"
import * as reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    __esModule: true,
    warn: jest.fn(),
  }
})

const testPlugin = {
  name: `gatsby-source-test`,
}

describe(`Add request headers`, () => {
  it(`allows you to add request headers`, () => {
    const action = actions.setRequestHeaders(
      {
        domain: `https://testdomain.com/subpath`,
        headers: {
          "X-Header": `test`,
        },
      },
      testPlugin
    )
    expect(action.payload.domain).toBe(`testdomain.com`)
    expect(action.payload.headers).toEqual({
      "X-Header": `test`,
    })
    expect(action).toMatchSnapshot()

    const state = reducer(undefined, action)

    expect(state.get(`testdomain.com`)).toEqual({
      "X-Header": `test`,
    })
    expect(state).toMatchSnapshot()
  })

  it(`fails if domain is missing`, () => {
    actions.setRequestHeaders(
      {
        headers: {
          "X-Header": `test`,
        },
      },
      testPlugin
    )

    expect(reporter.warn).toHaveBeenCalledWith(
      `Plugin gatsby-source-test called actions.setRequestHeaders with a domain property that isn't a string.`
    )
  })

  it(`fails if headers are missing`, () => {
    actions.setRequestHeaders(
      {
        domain: `https://testdomain.com/subpath`,
      },
      testPlugin
    )

    expect(reporter.warn).toHaveBeenCalledWith(
      `Plugin gatsby-source-test called actions.setRequestHeaders with a headers property that isn't an object.`
    )
  })
})
