// const { shallow } = require(`enzyme`)
const { onRenderBody } = require(`../gatsby-ssr`)

let headComponents
const setHeadComponents = args => (headComponents = headComponents.concat(args))

const ssrArgs = {
  setHeadComponents,
}

describe(`gatsby-plugin-manifest`, () => {
  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    headComponents = []
  })

  it(`Adds a "theme color" meta tag to head if "theme_color_in_head" is not provided`, () => {
    onRenderBody(ssrArgs, { theme_color: `#000000` })
    expect(headComponents).toMatchSnapshot()
  })

  it(`Does not add a "theme color" meta tag if "theme_color_in_head" is set to false`, () => {
    onRenderBody(ssrArgs, {
      theme_color: `#000000`,
      theme_color_in_head: false,
    })
    expect(headComponents).toMatchSnapshot()
  })

  it(`Add a "theme color" meta tag if "theme_color_in_head" is set to true`, () => {
    onRenderBody(ssrArgs, {
      theme_color: `#000000`,
      theme_color_in_head: true,
    })
    expect(headComponents).toMatchSnapshot()
  })

  it(`Adds "shortcut icon" and "manifest" links and "theme_color" meta tag to head`, () => {
    onRenderBody(ssrArgs, { icon: true, theme_color: `#000000` })
    expect(headComponents).toMatchSnapshot()
  })

  it(`Does not add a "theme_color" meta tag to head if "theme_color" option is not provided or is an empty string`, () => {
    onRenderBody(ssrArgs, { icon: true })
    expect(headComponents).toMatchSnapshot()
  })

  describe(`Creates legacy apple touch links if opted in`, () => {
    it(`Using default set of icons`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        theme_color: `#000000`,
        legacy: true,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Using user specified list of icons`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        theme_color: `#000000`,
        legacy: true,
        icons: [
          {
            src: `/favicons/android-chrome-48x48.png`,
            sizes: `48x48`,
            type: `image/png`,
          },
          {
            src: `/favicons/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      })
      expect(headComponents).toMatchSnapshot()
    })
  })

  it(`Creates href attributes using pathPrefix`, () => {
    global.__PATH_PREFIX__ = `/path-prefix`

    onRenderBody(ssrArgs, {
      icon: true,
      theme_color: `#000000`,
      legacy: true,
    })

    headComponents
      .filter(component => component.type === `link`)
      .forEach(component => {
        expect(component.props.href).toEqual(
          expect.stringMatching(/^\/path-prefix\//)
        )
      })
  })
})
