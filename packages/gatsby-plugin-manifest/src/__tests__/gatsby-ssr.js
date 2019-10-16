jest.mock(`fs`, () => {
  return {
    readFileSync: jest.fn().mockImplementation(() => `someIconImage`),
  }
})

jest.mock(`gatsby-core-utils`, () => {
  return {
    createContentDigest: jest.fn(() => `contentDigest`),
  }
})

const { onRenderBody } = require(`../gatsby-ssr`)

let headComponents
const setHeadComponents = args => (headComponents = headComponents.concat(args))

const ssrArgs = {
  setHeadComponents,
  pathname: `/`,
}

describe(`gatsby-plugin-manifest`, () => {
  beforeEach(() => {
    global.__BASE_PATH__ = ``
    global.__PATH_PREFIX__ = ``
    headComponents = []
  })

  it(`Creates href attributes using pathPrefix`, () => {
    global.__PATH_PREFIX__ = `/path-prefix`

    onRenderBody(ssrArgs, {
      icon: true,
      theme_color: `#000000`,
    })

    headComponents
      .filter(component => component.type === `link`)
      .forEach(component => {
        expect(component.props.href).toEqual(
          expect.stringMatching(/^\/path-prefix\//)
        )
      })
  })

  describe(`Manifest Link Generation`, () => {
    it(`Adds a "theme color" meta tag to head if "theme_color_in_head" is not provided`, () => {
      onRenderBody(ssrArgs, {
        theme_color: `#000000`,
        include_favicon: false,
        cache_busting_mode: false,
        legacy: false,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Add a "theme color" meta tag if "theme_color_in_head" is set to true`, () => {
      onRenderBody(ssrArgs, {
        theme_color: `#000000`,
        theme_color_in_head: true,
        include_favicon: false,
        cache_busting_mode: false,
        legacy: false,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does not add a "theme color" meta tag if "theme_color_in_head" is set to false`, () => {
      onRenderBody(ssrArgs, {
        theme_color: `#000000`,
        theme_color_in_head: false,
        include_favicon: false,
        cache_busting_mode: false,
        legacy: false,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does not add a "theme_color" meta tag to head if "theme_color" option is not provided.`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        include_favicon: false,
        cache_busting_mode: false,
        legacy: false,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Adds "shortcut icon" and "manifest" links and "theme_color" meta tag to head`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        theme_color: `#000000`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    const i18nArgs = [
      {
        ...ssrArgs,
        pathname: `/about-us`,
        testName: `Adds correct (default) i18n "manifest" link to head`,
      },
      {
        ...ssrArgs,
        pathname: `/es/sobre-nosotros`,
        testName: `Adds correct (es) i18n "manifest" link to head`,
      },
    ]

    i18nArgs.forEach(({ testName, ...args }) =>
      it(testName, () => {
        onRenderBody(args, {
          start_url: `/`,
          lang: `en`,
          localize: [
            {
              start_url: `/de/`,
              lang: `de`,
            },
            {
              start_url: `/es/`,
              lang: `es`,
            },
          ],
        })
        expect(headComponents).toMatchSnapshot()
      })
    )
  })

  describe(`Legacy Icons`, () => {
    describe(`Does create legacy links`, () => {
      it(`if "legacy" not specified in automatic mode`, () => {
        onRenderBody(ssrArgs, {
          icon: true,
          theme_color: `#000000`,
          include_favicon: false,
          cache_busting_mode: `none`,
          theme_color_in_head: false,
        })
        expect(headComponents).toMatchSnapshot()
      })

      it(`if "legacy" not specified in hybrid mode.`, () => {
        onRenderBody(ssrArgs, {
          icon: true,
          theme_color: `#000000`,
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
          include_favicon: false,
          cache_busting_mode: `none`,
          theme_color_in_head: false,
        })
        expect(headComponents).toMatchSnapshot()
      })

      it(`if "legacy" not specified in manual mode.`, () => {
        onRenderBody(ssrArgs, {
          icon: false,
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

    describe(`Does not create legacy links`, () => {
      it(`If "legacy" options is false and in automatic`, () => {
        onRenderBody(ssrArgs, {
          icon: true,
          legacy: false,
          include_favicon: false,
          cache_busting_mode: false,
        })
        expect(headComponents).toMatchSnapshot()
      })

      it(`If "legacy" options is false and in manual mode`, () => {
        onRenderBody(ssrArgs, {
          icon: false,
          theme_color: `#000000`,
          legacy: false,
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

      it(`If "legacy" options is false and in hybrid mode`, () => {
        onRenderBody(ssrArgs, {
          icon: true,
          legacy: false,
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
          include_favicon: false,
          cache_busting_mode: false,
        })
        expect(headComponents).toMatchSnapshot()
      })
    })
  })

  describe(`Cache Busting`, () => {
    it(`doesn't add cache busting in manual mode`, () => {
      onRenderBody(ssrArgs, {
        icon: false,
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
        cache_busting_mode: `name`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`doesn't add cache busting if "cache_busting_mode" option is set to none`, () => {
      onRenderBody(ssrArgs, { icon: true, cache_busting_mode: `none` })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does file name cache busting if "cache_busting_mode" option is set to name`, () => {
      onRenderBody(ssrArgs, { icon: true, cache_busting_mode: `name` })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does query cache busting if "cache_busting_mode" option is set to query`, () => {
      onRenderBody(ssrArgs, { icon: true, cache_busting_mode: `query` })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does query cache busting if "cache_busting_mode" option is set to undefined`, () => {
      onRenderBody(ssrArgs, { icon: true })
      expect(headComponents).toMatchSnapshot()
    })
  })

  describe(`Favicon`, () => {
    it(`Adds link favicon tag if "include_favicon" is set to true`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        include_favicon: true,
        legacy: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does not add a link favicon if "include_favicon" option is set to false`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        include_favicon: false,
        legacy: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does not add a link favicon if in manual mode`, () => {
      onRenderBody(ssrArgs, {
        icon: false,
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
        legacy: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })
  })

  describe(`CORS Generation`, () => {
    it(`Adds a crossOrigin attribute to manifest link tag if provided`, () => {
      onRenderBody(ssrArgs, {
        crossOrigin: `use-credentials`,
        legacy: false,
        include_favicon: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Add crossOrigin when 'crossOrigin' is anonymous`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        crossOrigin: `anonymous`,
        legacy: false,
        include_favicon: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })

    it(`Does not add crossOrigin when 'crossOrigin' is blank`, () => {
      onRenderBody(ssrArgs, {
        icon: true,
        legacy: false,
        include_favicon: false,
        cache_busting_mode: `none`,
      })
      expect(headComponents).toMatchSnapshot()
    })
  })
})
