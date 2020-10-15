import { onPreRenderHTML, onRenderBody } from "../gatsby-ssr"

jest.mock(
  `typography-plugin-cache-endpoint`,
  () => {
    return {}
  },
  { virtual: true }
)

const clone = arr => arr.reduce((merged, item) => merged.concat(item), [])

describe(`onRenderBody`, () => {
  const setup = (options = {}, env = `build-html`) => {
    process.env.BUILD_STAGE = env
    const api = {
      setHeadComponents: jest.fn(),
    }
    onRenderBody(api, options)
    return api
  }

  afterAll(() => {
    delete process.env.BUILD_STAGE
  })

  it(`invokes setHeadComponents with array of typography components`, () => {
    const api = setup()

    expect(api.setHeadComponents).toHaveBeenCalledWith([
      expect.objectContaining({ key: `TypographyStyle` }),
      expect.objectContaining({ key: `GoogleFont` }),
    ])
  })

  it(`does not add google font if omitGoogleFont is passed`, () => {
    const api = setup({
      omitGoogleFont: true,
    })

    expect(api.setHeadComponents).toHaveBeenCalledWith([
      expect.objectContaining({ key: `TypographyStyle` }),
    ])
  })
})

describe(`onPreRenderHTML`, () => {
  const setup = (components = []) => {
    const api = {
      getHeadComponents: jest.fn(() => components),
      replaceHeadComponents: jest.fn(),
    }
    onPreRenderHTML(api)
    return api
  }

  it(`reorders typography-js first`, () => {
    const spies = setup([
      {
        key: `link-1234`,
      },
      {
        key: `link-preload`,
      },
      {
        key: `TypographyStyle`,
      },
    ])

    expect(spies.replaceHeadComponents).toHaveBeenCalledTimes(1)
    expect(spies.replaceHeadComponents).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          key: `TypographyStyle`,
        },
      ])
    )
  })

  it(`leaves non-typography head components as-is`, () => {
    const components = [
      {
        key: `link-1234`,
      },
      {
        key: `link-preload`,
      },
      {
        key: `_____01234_____`,
      },
    ]

    const spies = setup(clone(components))

    expect(spies.replaceHeadComponents).toHaveBeenCalledWith(components)
  })

  it(`does not fail when head components include null`, () => {
    const components = [
      {
        key: `link-1234`,
      },
      {
        key: `link-preload`,
      },
      {
        key: `_____01234_____`,
      },
      null,
    ]

    const spies = setup(clone(components))

    expect(spies.replaceHeadComponents).toHaveBeenCalledWith(components)
    expect(spies.replaceHeadComponents).toHaveReturned()
  })
})
