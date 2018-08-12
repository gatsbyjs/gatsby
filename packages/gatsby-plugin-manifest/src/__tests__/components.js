const { generateHeadComponents } = require(`../components`)

describe(`gatsby-plugin-manifest`, () => {
  describe(`generateHeadComponents`, () => {
    it(`creates head components`, () => {
      const headComponents = [];
      for (const component of generateHeadComponents(
        path => path,
        {
          icon: true,
          theme_color: `#000000`,
          manifest: {}
        }
      )) { headComponents.push(component) }
      expect(headComponents).toMatchSnapshot()
    })
    it(`creates prefixed head components`, () => {
      const headComponents = [];
      for (const component of generateHeadComponents(
        path => `/prefix${path}`,
        {
          icon: true,
          theme_color: `#000000`,
          manifest: {}
        }
      )) { headComponents.push(component) }
      expect(headComponents).toMatchSnapshot()
    })
  })
})
