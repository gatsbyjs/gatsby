import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`gatsby-plugin-sass`, () => {
  jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

  const actions = {
    setWebpackConfig: jest.fn(),
  }

  // loaders "mocks"
  const loaders = {
    miniCssExtract: () => `miniCssExtract`,
    css: args => `css(${JSON.stringify(args)})`,
    postcss: args => `postcss(${JSON.stringify(args)})`,
    null: () => `null`,
  }

  const { onCreateWebpackConfig } = require(`../gatsby-node`)

  beforeEach(() => {
    actions.setWebpackConfig.mockReset()
  })

  const tests = {
    stages: [`develop`, `build-javascript`, `develop-html`, `build-html`],
    options: {
      "No options": {},
      "Sass options": {
        sassOptions: {
          includePaths: [`absolute/path/a`, `absolute/path/b`],
        },
      },
      "PostCss plugins": {
        postCssPlugins: [`test1`],
      },
      "css-loader options": {
        cssLoaderOptions: {
          camelCase: false,
        },
      },
      "sass rule test options": {
        sassRuleTest: /\.global\.s(a|c)ss$/,
      },
      "sass rule modules test options": {
        sassRuleModulesTest: /\.global\.s(a|c)ss$/,
      },
      "css-loader use commonjs": {
        cssLoaderOptions: {
          esModule: false,
          modules: {
            namedExport: false,
          },
        },
      },
    },
  }

  tests.stages.forEach(stage => {
    for (const label in tests.options) {
      if (tests.options[label]) {
        const options = tests.options[label]
        it(`Stage: ${stage} / ${label}`, () => {
          onCreateWebpackConfig({ actions, loaders, stage }, options)
          expect(actions.setWebpackConfig).toMatchSnapshot()
        })
      }
    }
  })
})

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"implementation" must be of type object`,
      `"additionalData" must be one of [string, object]`,
      `"cssLoaderOptions" must be of type object`,
      `"postCssPlugins" must be an array`,
      `"sassRuleTest" must be of type object`,
      `"sassRuleModulesTest" must be of type object`,
      `"useResolveUrlLoader" must be one of [boolean, object]`,
      `"sassOptions.file" must be a string`,
      `"sassOptions.data" must be a string`,
      `"sassOptions.importer" must be of type function`,
      `"sassOptions.functions" must be of type object`,
      `"sassOptions.includePaths" must be an array`,
      `"sassOptions.indentedSyntax" must be a boolean`,
      `"sassOptions.indentType" must be a string`,
      `"sassOptions.indentWidth" must be less than or equal to 10`,
      `"sassOptions.linefeed" must be one of [cr, crlf, lf, lfcr]`,
      `"sassOptions.omitSourceMapUrl" must be a boolean`,
      `"sassOptions.outFile" must be a string`,
      `"sassOptions.outputStyle" must be one of [nested, expanded, compact, compressed]`,
      `"sassOptions.precision" must be a number`,
      `"sassOptions.sourceComments" must be a boolean`,
      `"sassOptions.sourceMap" must be one of [boolean, string]`,
      `"sassOptions.sourceMapContents" must be a boolean`,
      `"sassOptions.sourceMapEmbed" must be a boolean`,
      `"sassOptions.sourceMapRoot" must be a string`,
    ]

    const { errors, isValid } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        additionalData: 123,
        implementation: `This should be a require() thing`,
        postCssPlugins: `This should be an array of postCss plugins`,
        cssLoaderOptions: `This should be an object of css-loader options`,
        sassRuleTest: `This should be a regexp`,
        sassRuleModulesTest: `This should be a regexp`,
        useResolveUrlLoader: `This should be a boolean`,
        sassOptions: {
          file: 123, // should be a string
          data: 123, // should be a string
          importer: `This should be a function`,
          functions: `This should be an object of { string: function }`,
          includePaths: 123, // should be an array of string
          indentedSyntax: `"useResolveUrlLoader" must be a boolean`,
          indentType: 123, // this should be a string
          indentWidth: 40,
          linefeed: `This should be cr, crlf, lf or lfcr`,
          omitSourceMapUrl: `This should be a boolean`,
          outFile: 123, // This should be a string
          outputStyle: `This should be nested, expanded, compact or compressed`,
          precision: `This should be a number`,
          sourceComments: `This should be a boolean`,
          sourceMap: 123, // This should be a string or a boolean
          sourceMapContents: `This should be a boolean`,
          sourceMapEmbed: `This should be a boolean`,
          sourceMapRoot: 123, // This should be a string
        },
      }
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        additionalData: `$test: #000;`,
        implementation: require(`../gatsby-node.js`),
        cssLoaderOptions: { camelCase: false },
        postCssPlugins: [require(`autoprefixer`)],
        sassRuleTest: /\.global\.s(a|c)ss$/,
        sassRuleModulesTest: /\.mod\.s(a|c)ss$/,
        useResolveUrlLoader: false,
        sassOptions: {
          file: `../path-to-file`,
          data: `{ some: data }`,
          importer: function () {
            return { file: `path-to-file`, contents: `data` }
          },
          functions: {
            "headings($from: 0, $to: 6)": function () {
              return []
            },
          },
          includePaths: [`some`, `path`],
          indentedSyntax: true,
          indentType: `tabs`,
          indentWidth: 7,
          linefeed: `crlf`,
          omitSourceMapUrl: true,
          outFile: `somewhere-around.css`,
          outputStyle: `expanded`,
          precision: 12,
          sourceComments: true,
          sourceMap: true,
          sourceMapContents: true,
          sourceMapEmbed: true,
          sourceMapRoot: `some-source-map-root`,
        },
      }
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })

  it(`should allow unknown options`, async () => {
    const { isValid, hasWarnings } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        webpackImporter: `unknown option`,
      }
    )

    expect(isValid).toBe(true)
    expect(hasWarnings).toBe(true)
  })
})
