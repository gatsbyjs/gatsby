import glob from "globby"
import path from "path"
import webpack from "webpack"

import {
  CreatePagesArgs,
  ParentSpanPluginArgs,
  SetFieldsOnGraphQLNodeTypeArgs,
  PluginOptions,
  PluginCallback,
} from "gatsby"

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export async function onPreInit(
  { reporter }: ParentSpanPluginArgs,
  { path: functionsDirectoryPath }: PluginOptions
): Promise<void> {
  const activity = reporter.activityTimer(`building functions`)
  activity.start()

  const functionsDirectory = path.resolve(
    process.cwd(),
    functionsDirectoryPath as string
  )

  console.log({ functionsDirectory })

  const functionsGlob = `**/*.{js,ts}`

  // Get initial list of files.
  const files = await glob(functionsGlob, { cwd: functionsDirectory })

  const knownFunctions = new Set(files)

  console.log(knownFunctions)

  activity.end()
}

// exports.onCreateWebpackConfig = (
//   { store, stage, getConfig, plugins, pathPrefix, loaders, rules, actions },
//   {
//     modulePath,
//     customizeWebpackConfig,
//     publicPath = `admin`,
//     enableIdentityWidget = true,
//     htmlTitle = `Content Manager`,
//     htmlFavicon = ``,
//     manualInit = false,
//     includeRobots = false,
//   }
// ) => {
//   if (![`develop`, `build-javascript`].includes(stage)) {
//     return Promise.resolve()
//   }

//   // populate cssTests array later used by isCssRule
//   if (`develop` === stage) {
//     cssTests.push(
//       ...[
//         rules.cssModules().test,
//         rules.css().test,
//         /\.s(a|c)ss$/,
//         /\.module\.s(a|c)ss$/,
//         /\.less$/,
//         /\.module\.less$/,
//       ].map(t => t.toString())
//     )
//   }

//   const gatsbyConfig = getConfig()
//   const { program } = store.getState()
//   const publicPathClean = trim(publicPath, `/`)

//   const externals = [
//     {
//       name: `react`,
//       global: `React`,
//       assetDir: `umd`,
//       assetName: `react.production.min.js`,
//     },
//     {
//       name: `react-dom`,
//       global: `ReactDOM`,
//       assetDir: `umd`,
//       assetName: `react-dom.production.min.js`,
//     },
//     {
//       name: `netlify-cms-app`,
//       global: `NetlifyCmsApp`,
//       assetDir: `dist`,
//       assetName: `netlify-cms-app.js`,
//       sourceMap: `netlify-cms-app.js.map`,
//     },
//   ]

//   if (enableIdentityWidget) {
//     externals.unshift({
//       name: `netlify-identity-widget`,
//       global: `netlifyIdentity`,
//       assetDir: `build`,
//       assetName: `netlify-identity.js`,
//       sourceMap: `netlify-identity.js.map`,
//     })
//   }

//   const config = {
//     ...gatsbyConfig,
//     entry: {
//       cms: [
//         path.join(__dirname, `cms.js`),
//         enableIdentityWidget && path.join(__dirname, `cms-identity.js`),
//       ]
//         .concat(modulePath)
//         .filter(p => p),
//     },
//     output: {
//       path: path.join(program.directory, `public`, publicPathClean),
//     },
//     module: {
//       rules: deepMap(gatsbyConfig.module.rules, value =>
//         replaceRule(value, stage)
//       ).filter(Boolean),
//     },
//     plugins: [
//       // Remove plugins that either attempt to process the core Netlify CMS
//       // application, or that we want to replace with our own instance.
//       ...gatsbyConfig.plugins.filter(
//         plugin =>
//           ![`MiniCssExtractPlugin`, `GatsbyWebpackStatsExtractor`].find(
//             pluginName =>
//               plugin.constructor && plugin.constructor.name === pluginName
//           )
//       ),

//       /**
//        * Provide a custom message for Netlify CMS compilation success.
//        */
//       stage === `develop` &&
//         new FriendlyErrorsPlugin({
//           clearConsole: false,
//           compilationSuccessInfo: {
//             messages: [
//               `Netlify CMS is running at ${
//                 program.https ? `https://` : `http://`
//               }${program.host}:${program.proxyPort}/${publicPathClean}/`,
//             ],
//           },
//         }),

//       // Use a simple filename with no hash so we can access from source by
//       // path.
//       new MiniCssExtractPlugin({
//         filename: `[name].css`,
//       }),

//       // Auto generate CMS index.html page.
//       new HtmlWebpackPlugin({
//         title: htmlTitle,
//         favicon: htmlFavicon,
//         chunks: [`cms`],
//         excludeAssets: [/cms.css/],
//         meta: {
//           robots: includeRobots ? `all` : `none`, // Control whether search engines index this page
//         },
//       }),

//       // Exclude CSS from index.html, as any imported styles are assumed to be
//       // targeting the editor preview pane. Uses `excludeAssets` option from
//       // `HtmlWebpackPlugin` config.
//       new HtmlWebpackExcludeAssetsPlugin(),

//       // Pass in needed Gatsby config values.
//       new webpack.DefinePlugin({
//         __PATH__PREFIX__: pathPrefix,
//         CMS_PUBLIC_PATH: JSON.stringify(publicPath),
//       }),

//       new CopyPlugin(
//         [].concat.apply(
//           [],
//           externals.map(({ name, assetName, sourceMap, assetDir }) =>
//             [
//               {
//                 from: require.resolve(path.join(name, assetDir, assetName)),
//                 to: assetName,
//               },
//               sourceMap && {
//                 from: require.resolve(path.join(name, assetDir, sourceMap)),
//                 to: sourceMap,
//               },
//             ].filter(item => item)
//           )
//         )
//       ),

//       new HtmlWebpackTagsPlugin({
//         tags: externals.map(({ assetName }) => assetName),
//         append: false,
//       }),

//       new webpack.DefinePlugin({
//         CMS_MANUAL_INIT: JSON.stringify(manualInit),
//         PRODUCTION: JSON.stringify(stage !== `develop`),
//       }),
//     ].filter(p => p),

//     // Remove common chunks style optimizations from Gatsby's default
//     // config, they cause issues for our pre-bundled code.
//     mode: stage === `develop` ? `development` : `production`,
//     optimization: {
//       // Without this, node can get out of memory errors when building for
//       // production.
//       minimizer: stage === `develop` ? [] : gatsbyConfig.optimization.minimizer,
//     },
//     devtool: stage === `develop` ? `cheap-module-source-map` : `source-map`,
//     externals: externals.map(({ name, global }) => {
//       return {
//         [name]: global,
//       }
//     }),
//   }

//   if (customizeWebpackConfig) {
//     customizeWebpackConfig(config, {
//       store,
//       stage,
//       pathPrefix,
//       getConfig,
//       rules,
//       loaders,
//       plugins,
//     })
//   }

//   actions.setWebpackConfig({
//     // force code splitting for netlify-identity-widget
//     optimization:
//       stage === `develop`
//         ? {}
//         : {
//             splitChunks: {
//               cacheGroups: {
//                 "netlify-identity-widget": {
//                   test: /[\\/]node_modules[\\/](netlify-identity-widget)[\\/]/,
//                   name: `netlify-identity-widget`,
//                   chunks: `all`,
//                   enforce: true,
//                 },
//               },
//             },
//           },
//     // ignore netlify-identity-widget when not enabled
//     plugins: enableIdentityWidget
//       ? []
//       : [
//           new webpack.IgnorePlugin({
//             resourceRegExp: /^netlify-identity-widget$/,
//           }),
//         ],
//   })

//   return new Promise((resolve, reject) => {
//     if (stage === `develop`) {
//       webpack(config).watch({}, () => {})

//       return resolve()
//     }

//     return webpack(config).run((err, stats) => {
//       if (err) return reject(err)
//       const errors = stats.compilation.errors || []
//       if (errors.length > 0) return reject(stats.compilation.errors)
//       return resolve()
//     })
//   })
// }
