const preset = require(`../index.js`)

jest.mock(`../resolver`, () => jest.fn(moduleName => moduleName))

const itWhenV4 = _CFLAGS_.GATSBY_MAJOR !== `5` ? it : it.skip
const itWhenV5 = _CFLAGS_.GATSBY_MAJOR === `5` ? it : it.skip

describe(`babel-preset-gatsby-package`, () => {
  let babelEnv

  beforeEach(() => {
    babelEnv = process.env.BABEL_ENV
    delete process.env.BABEL_ENV
  })

  afterEach(() => {
    process.env.BABEL_ENV = babelEnv
  })

  describe(`in node mode`, () => {
    itWhenV4(`specifies the proper plugins (v4)`, () => {
      const { plugins } = preset()
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "GATSBY_MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "4",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })

    itWhenV5(`specifies the proper plugins (v5)`, () => {
      const { plugins } = preset()
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "GATSBY_MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "5",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })

    it(`specifies proper presets`, () => {
      const { presets } = preset()
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for debugging`, () => {
      const { presets } = preset(null, { debug: true })
      expect(presets).toMatchSnapshot()
    })

    it(`can pass custom nodeVersion target`, () => {
      const nodeVersion = `6.0`
      const { presets } = preset(null, {
        nodeVersion,
      })

      const [, opts] = presets.find(preset =>
        [].concat(preset).includes(`@babel/preset-env`)
      )

      expect(opts.targets.node).toBe(nodeVersion)
    })

    itWhenV4(`can enable compilerFlags (v4)`, () => {
      const { plugins } = preset(null, { availableCompilerFlags: [`MAJOR`] })
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "4",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })

    itWhenV5(`can enable compilerFlags (v5)`, () => {
      const { plugins } = preset(null, { availableCompilerFlags: [`MAJOR`] })
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "5",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })
  })

  describe(`in browser mode`, () => {
    itWhenV4(`specifies the proper plugins (v4)`, () => {
      const { plugins } = preset(null, { browser: true })
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "GATSBY_MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "4",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })

    itWhenV5(`specifies the proper plugins (v5)`, () => {
      const { plugins } = preset(null, { browser: true })
      expect(plugins).toMatchInlineSnapshot(`
        Array [
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-runtime",
          "@babel/plugin-syntax-dynamic-import",
          "babel-plugin-dynamic-import-node",
          Array [
            "./babel-transform-compiler-flags",
            Object {
              "availableFlags": Array [
                "GATSBY_MAJOR",
              ],
              "flags": Object {
                "GATSBY_MAJOR": "5",
              },
            },
          ],
          "@sigmacomputing/babel-plugin-lodash",
        ]
      `)
    })

    it(`specifies proper presets`, () => {
      const { presets } = preset(null, { browser: true })
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for debugging`, () => {
      const { presets } = preset(null, { browser: true, debug: true })
      expect(presets).toMatchSnapshot()
    })

    it(`specifies proper presets for esm`, () => {
      const { presets } = preset(null, { browser: true, esm: true })
      expect(presets).toMatchSnapshot()
    })
  })
})
