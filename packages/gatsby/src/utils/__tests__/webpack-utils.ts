import * as os from "os"
import { createWebpackUtils } from "../webpack-utils"
import { Stage, IProgram } from "../../commands/types"

import autoprefixer from "autoprefixer"

jest.mock(`../browserslist`, () => {
  return {
    getBrowsersList: (): Array<string> => [],
  }
})

jest.mock(`babel-preset-gatsby/package.json`, () => {
  return {
    version: `1.0.0`,
  }
})

jest.mock(`autoprefixer`, () =>
  jest.fn(options => {
    return {
      options,
      postcssPlugin: `autoprefixer`,
    }
  })
)

let config

beforeAll(() => {
  config = createWebpackUtils(Stage.Develop, {
    directory: `${os.tmpdir()}/test`,
  } as IProgram)
})

describe(`webpack utils`, () => {
  describe(`js`, () => {
    it(`adds .js rule`, () => {
      expect(config.rules.js).toEqual(expect.any(Function))
    })
    it(`uses the babel loader`, () => {
      const rule = config.rules.js([])
      const { loader } = rule.use({ issuer: `` })[0]
      expect(loader).toInclude(`babel-loader`)
    })
    it(`has default options`, () => {
      const rule = config.rules.js([])
      const { options } = rule.use({ issuer: `` })[0]
      expect(options).toMatchSnapshot()
    })
    it(`recognizes issuers for page templates`, () => {
      const rule = config.rules.js([])
      const { options } = rule.use({
        issuer: `/Users/sidharthachatterjee/Code/gatsby-seo-test/.cache/_this_is_virtual_fs_path_/async-requires.js`,
      })[0]
      expect(options.isPageTemplate).toBeTrue()
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
            `/Users/sidharthachatterjee/Code/gatsby-seo-test/node_modules/awesome-lib/index.js`
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
  describe(`postcss`, () => {
    it(`adds postcss rule`, () => {
      expect(config.loaders.postcss).toEqual(expect.any(Function))
    })
    describe(`uses defaults when no options are passed`, () => {
      let postcss
      beforeAll(() => {
        postcss = config.loaders.postcss()
      })
      it(`initialises autoprefixer with defaults`, () => {
        postcss.options.postcssOptions(postcss.loader)
        expect(autoprefixer).toBeCalled()
        expect(autoprefixer).toBeCalledWith({
          flexbox: `no-2009`,
          overrideBrowserslist: [],
        })
      })
    })
    describe(`uses override options when they are passed`, () => {
      let postcss
      beforeAll(() => {
        jest.clearAllMocks()
        postcss = config.loaders.postcss({
          plugins: [
            autoprefixer({
              grid: `no-autoplace`,
            }),
          ],
        })
      })
      it(`initialises autoprefixer with overrides`, () => {
        postcss.options.postcssOptions(postcss.loader)
        expect(autoprefixer).toBeCalled()
        expect(autoprefixer).toBeCalledWith({
          flexbox: `no-2009`,
          grid: `no-autoplace`,
          overrideBrowserslist: [],
        })
      })
    })
  })
})
