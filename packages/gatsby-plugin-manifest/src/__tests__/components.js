const { generateHeadComponents } = require(`../components`)

describe(`gatsby-plugin-manifest`, () => {
  describe(`generateHeadComponents`, () => {
    it(`creates automatic mode head components`, () => {
      const headComponents = []
      for (const component of generateHeadComponents(path => path, {
        icon: true,
        theme_color: `#000000`,
      })) {
        headComponents.push(component)
      }
      expect(headComponents).toMatchSnapshot()
    })
    it(`creates automatic mode head components prefixed`, () => {
      const headComponents = []
      for (const component of generateHeadComponents(path => `/prefix${path}`, {
        icon: true,
        theme_color: `#000000`,
      })) {
        headComponents.push(component)
      }
      expect(headComponents).toMatchSnapshot()
    })
    it(`creates hybrid mode head components`, () => {
      const headComponents = []
      for (const component of generateHeadComponents(path => path, {
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
      })) {
        headComponents.push(component)
      }
      expect(headComponents).toMatchSnapshot()
    })
  })
})
