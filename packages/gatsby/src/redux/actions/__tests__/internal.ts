import { setSiteConfig } from "../internal"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

beforeEach(() => {
  ;(reporter as any).panic.mockClear()
})

describe(`setSiteConfig`, () => {
  it(`let's you add a config`, () => {
    const action = setSiteConfig({
      siteMetadata: {
        hi: true,
      },
    })
    expect(action).toMatchInlineSnapshot(`
      Object {
        "payload": Object {
          "graphqlTypegen": false,
          "headers": Array [],
          "jsxRuntime": "classic",
          "pathPrefix": "",
          "polyfill": true,
          "siteMetadata": Object {
            "hi": true,
          },
          "trailingSlash": "always",
        },
        "type": "SET_SITE_CONFIG",
      }
    `)
  })

  it(`handles empty configs`, () => {
    const action = setSiteConfig()
    expect(action).toMatchInlineSnapshot(`
      Object {
        "payload": Object {
          "graphqlTypegen": false,
          "headers": Array [],
          "jsxRuntime": "classic",
          "pathPrefix": "",
          "polyfill": true,
          "trailingSlash": "always",
        },
        "type": "SET_SITE_CONFIG",
      }
    `)
  })

  it(`Validates configs with unsupported options`, () => {
    setSiteConfig({
      someRandomThing: `hi people`,
      plugins: [],
    })

    expect(reporter.panic).toBeCalledWith({
      id: `10122`,
      context: {
        sourceMessage: `"someRandomThing" is not allowed`,
      },
    })
  })

  it(`It corrects pathPrefixes without a forward slash at beginning`, () => {
    const action = setSiteConfig({
      pathPrefix: `prefix`,
    })

    expect(action.payload.pathPrefix).toBe(`/prefix`)
  })

  it(`It removes trailing forward slash`, () => {
    const action = setSiteConfig({
      pathPrefix: `/prefix/`,
    })
    expect(action.payload.pathPrefix).toBe(`/prefix`)
  })

  it(`It removes pathPrefixes that are a single forward slash`, () => {
    const action = setSiteConfig({
      pathPrefix: `/`,
    })
    expect(action.payload.pathPrefix).toBe(``)
  })

  it(`It sets the pathPrefix to an empty string if it's not set`, () => {
    const action = setSiteConfig({})
    expect(action.payload.pathPrefix).toBe(``)
  })

  it(`It warns with a suggestion when an invalid key is passed`, () => {
    setSiteConfig({
      plugin: [],
    })

    expect(reporter.panic).toBeCalledWith({
      id: `10122`,
      context: {
        sourceMessage: `"plugin" is not allowed. Did you mean "plugins"?`,
      },
    })
  })
})
