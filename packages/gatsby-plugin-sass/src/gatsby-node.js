import resolve from "./resolve"

exports.onCreateWebpackConfig = (
  { actions, stage, loaders },
  {
    cssLoaderOptions = {},
    postCssPlugins,
    useResolveUrlLoader,
    sassRuleTest,
    sassRuleModulesTest,
    sassOptions = {},
    // eslint-disable-next-line no-unused-vars
    plugins,
    additionalData = undefined,
    ...sassLoaderOptions
  }
) => {
  const { setWebpackConfig } = actions
  const isSSR = [`develop-html`, `build-html`].includes(stage)

  const sassLoader = {
    loader: resolve(`sass-loader`),
    options: {
      sourceMap: useResolveUrlLoader ? true : undefined,
      sassOptions,
      additionalData,
      ...sassLoaderOptions,
    },
  }

  const sassRule = {
    test: sassRuleTest || /\.s(a|c)ss$/,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({
            importLoaders: 2,
            ...cssLoaderOptions,
            modules: false,
          }),
          loaders.postcss({ plugins: postCssPlugins }),
        ],
  }

  const sassRuleModules = {
    test: sassRuleModulesTest || /\.module\.s(a|c)ss$/,
    use: [
      !isSSR &&
        loaders.miniCssExtract({
          modules: {
            namedExport: cssLoaderOptions.modules?.namedExport ?? true,
          },
        }),
      loaders.css({
        importLoaders: 2,
        ...cssLoaderOptions,
        modules: cssLoaderOptions.modules ?? true,
      }),
      loaders.postcss({ plugins: postCssPlugins }),
    ].filter(Boolean),
  }
  if (useResolveUrlLoader && !isSSR) {
    sassRule.use.push({
      loader: `resolve-url-loader`,
      options: useResolveUrlLoader.options ? useResolveUrlLoader.options : {},
    })
    sassRuleModules.use.push({
      loader: `resolve-url-loader`,
      options: useResolveUrlLoader.options ? useResolveUrlLoader.options : {},
    })
  }

  // add sass loaders
  sassRule.use.push(sassLoader)
  sassRuleModules.use.push(sassLoader)

  const configRules = [
    {
      oneOf: [sassRuleModules, sassRule],
    },
  ]

  setWebpackConfig({
    module: {
      rules: configRules,
    },
  })
}

const MATCH_ALL_KEYS = /^/
exports.pluginOptionsSchema = function ({ Joi }) {
  return Joi.object({
    implementation: Joi.object({})
      .unknown(true)
      .description(
        `By default the node implementation of Sass (node-sass) is used. To use the implementation written in Dart (dart-sass), you can install sass instead of node-sass and pass it into the options as the implementation`
      ),
    additionalData: Joi.alternatives()
      .try(Joi.string(), Joi.function())
      .description(
        `Prepends Sass/SCSS code before the actual entry file. In this case, the sass-loader will not override the data option but just prepend the entry's content. Learn more at: https://webpack.js.org/loaders/sass-loader/#additionaldata`
      ),
    cssLoaderOptions: Joi.object({})
      .unknown(true)
      .description(
        `Pass in options for css-loader: https://github.com/webpack-contrib/css-loader/tree/version-1#options`
      ),
    postCssPlugins: Joi.array()
      .items(Joi.any())
      .description(`An array of postCss plugins`),
    sassRuleTest: Joi.object()
      .instance(RegExp)
      .description(`Override the file regex for Sass`),
    sassRuleModulesTest: Joi.object()
      .instance(RegExp)
      .description(`Override the file regex for Sass`),
    useResolveUrlLoader: Joi.alternatives().try(
      Joi.boolean(),
      Joi.object({}).unknown(true)
    )
      .description(`This plugin resolves url() paths relative to the entry SCSS/Sass file not – as might be expected – the location relative to the declaration. Under the hood, it makes use of sass-loader and this is documented in the readme.

        Using resolve-url-loader provides a workaround, if you want to use relative url just install the plugin and then add it to your Sass plugin options configuration.`),
    // TODO: Use alternatives() to also allow function. Currently some bug in our schema validation (test)
    sassOptions: Joi.object({
      file: Joi.string()
        .allow(null)
        .description(`Path to a file for LibSass to compile.`)
        .default(null),
      data: Joi.string()
        .allow(null)
        .description(
          `A string to pass to LibSass to compile. It is recommended that you use includePaths in conjunction with this so that LibSass can find files when using the @import directive.`
        )
        .default(null),
      importer: Joi.function()
        .maxArity(3)
        .description(
          `Handles when LibSass encounters the @import directive. A custom importer allows extension of the LibSass engine in both a synchronous and asynchronous manner. In both cases, the goal is to either return or call done() with an object literal. (https://github.com/sass/node-sass#importer--v200---experimental)`
        ),
      functions: Joi.object()
        .pattern(MATCH_ALL_KEYS, Joi.function().maxArity(2))
        .description(
          `functions is an Object that holds a collection of custom functions that may be invoked by the Sass files being compiled.`
        ),
      includePaths: Joi.array()
        .items(Joi.string())
        .default([])
        .description(
          `An array of paths that LibSass can look in to attempt to resolve your @import declarations. When using data, it is recommended that you use this.`
        ),
      indentedSyntax: Joi.boolean()
        .default(false)
        .description(
          `true values enable Sass Indented Syntax for parsing the data string or file.`
        ),
      indentType: Joi.string()
        .default(`space`)
        .description(
          `Used to determine whether to use space or tab character for indentation.`
        ),
      indentWidth: Joi.number()
        .default(2)
        .max(10)
        .description(
          `Used to determine the number of spaces or tabs to be used for indentation.`
        ),
      linefeed: Joi.string()
        .default(`lf`)
        .valid(`cr`, `crlf`, `lf`, `lfcr`)
        .description(
          `Used to determine whether to use cr, crlf, lf or lfcr sequence for line break.`
        ),
      omitSourceMapUrl: Joi.boolean()
        .default(false)
        .description(
          `true values disable the inclusion of source map information in the output file.`
        ),
      outFile: Joi.string()
        .allow(null)
        .default(null)
        .description(
          `Specify the intended location of the output file. Strongly recommended when outputting source maps so that they can properly refer back to their intended files.`
        ),
      outputStyle: Joi.string()
        .valid(`nested`, `expanded`, `compact`, `compressed`)
        .description(`Determines the output format of the final CSS style.`),
      precision: Joi.number()
        .default(5)
        .description(
          `Used to determine how many digits after the decimal will be allowed. For instance, if you had a decimal number of 1.23456789 and a precision of 5, the result will be 1.23457 in the final CSS.`
        ),
      sourceComments: Joi.boolean()
        .default(false)
        .description(
          `true Enables the line number and file where a selector is defined to be emitted into the compiled CSS as a comment. Useful for debugging, especially when using imports and mixins.`
        ),
      sourceMap: Joi.alternatives()
        .try(Joi.boolean(), Joi.string())
        .description(
          `Enables source map generation during render and renderSync.

When sourceMap === true, the value of outFile is used as the target output location for the source map with the suffix .map appended. If no outFile is set, sourceMap parameter is ignored.
When typeof sourceMap === "string", the value of sourceMap will be used as the writing location for the file`
        ),
      sourceMapContents: Joi.boolean()
        .default(false)
        .description(
          `true includes the contents in the source map information`
        ),
      sourceMapEmbed: Joi.boolean()
        .default(false)
        .description(`true embeds the source map as a data URI`),
      sourceMapRoot: Joi.string().description(
        `the value will be emitted as sourceRoot in the source map information`
      ),
    }).unknown(true),
  }).unknown(true)
}
