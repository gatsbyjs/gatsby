const utils = require(`../webpack-utils`)

jest.mock(`babel-preset-gatsby/package.json`, () => {
  return {
    version: `1.0.0`,
  }
})

let config
beforeAll(async () => {
  config = await utils({
    stage: `develop`,
    program: {
      browserslist: [],
    },
  })
})

describe(`webpack utils`, () => {
  describe(`js`, () => {
    it(`adds .js rule`, () => {
      expect(config.rules.js).toEqual(expect.any(Function))
    })

    it(`returns default values without any options`, () => {
      const rule = config.rules.js()

      expect(rule).toMatchSnapshot({
        use: [
          {
            loader: expect.stringContaining(`babel-loader`),
          },
        ],
      })
    })
    describe(`include function`, () => {
      let js
      beforeAll(() => {
        js = config.rules.js({
          modulesThatUseGatsby: [
            {
              name: `gatsby-seo`,
              path: `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/gatsby-seo`,
            },
          ],
        })
      })

      it(`includes source files from user code`, () => {
        expect(
          js.include(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/src/pages/index.js`
          )
        ).toEqual(true)
      })
      it(`includes files from .cache`, () => {
        expect(
          js.include(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/.cache/production-app.js`
          )
        ).toEqual(true)
      })
      it(`includes dependencies that use gatsby`, () => {
        expect(
          js.include(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/gatsby-seo/index.js`
          )
        ).toEqual(true)
      })
      it(`does not include other dependencies`, () => {
        expect(
          js.include(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/react/index.js`
          )
        ).toEqual(false)
      })
      it(`includes gatsby-browser.js`, () => {
        expect(
          js.include(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/gatsby-browser.js`
          )
        ).toEqual(true)
      })
    })
  })
  describe(`dependencies`, () => {
    it(`adds dependency rule`, () => {
      expect(config.rules.dependencies).toEqual(expect.any(Function))
    })
    it(`returns default values without any options`, () => {
      const rule = config.rules.dependencies()

      expect(rule).toMatchSnapshot({
        use: [
          {
            loader: expect.stringContaining(`babel-loader`),
          },
        ],
      })
    })
    describe(`exclude function`, () => {
      let dependencies
      beforeAll(() => {
        dependencies = config.rules.dependencies({
          modulesThatUseGatsby: [
            {
              name: `gatsby-seo`,
              path: `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/gatsby-seo`,
            },
          ],
        })
      })
      it(`excludes source files from user code`, () => {
        expect(
          dependencies.exclude(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/src/pages/index.js`
          )
        ).toEqual(true)
      })
      it(`excludes files from .cache`, () => {
        expect(
          dependencies.exclude(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/.cache/production-app.js`
          )
        ).toEqual(true)
      })
      it(`excludes dependencies that use gatsby`, () => {
        expect(
          dependencies.exclude(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/gatsby-seo/index.js`
          )
        ).toEqual(true)
      })
      it(`excludes babel-runtime`, () => {
        expect(
          dependencies.exclude(
            `/Users/misiek/test/pr15285/node_modules/@babel/runtime/helpers/interopRequireDefault.js`
          )
        ).toEqual(true)
      })
      it(`excludes core-js`, () => {
        expect(
          dependencies.exclude(
            `/Users/misiek/test/pr15285/node_modules/core-js/modules/es6.array.iterator.js`
          )
        ).toEqual(true)
      })
      it(`includes dependencies that don't use gatsby`, () => {
        expect(
          dependencies.exclude(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/react/index.js`
          )
        ).toEqual(false)
      })
      it(`excludes gatsby-browser.js`, () => {
        expect(
          dependencies.exclude(
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/gatsby-browser.js`
          )
        ).toEqual(true)
      })
    })
  })
})
