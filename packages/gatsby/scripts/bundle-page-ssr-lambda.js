// `.cache/page-ssr/lambda.js` is the entry point of the SSR/DSG serverless
// function. Adapters ship it as-is, so it has to be standalone - it can't
// require anything from `node_modules`. It's bundled here, at package build
// time, instead of during every `gatsby build`, because nothing in it is
// site-specific: the few site-specific values are `%PLACEHOLDER%` strings
// that `utils/page-ssr-module/bundle-webpack.ts` substitutes at build time.
const path = require(`path`)
const webpack = require(`webpack`)

const packageRoot = path.join(__dirname, `..`)

const compiler = webpack({
  name: `Page SSR Lambda`,
  mode: `none`,
  target: `node`,
  devtool: false,
  context: packageRoot,
  entry: path.join(packageRoot, `src`, `utils`, `page-ssr-module`, `lambda.ts`),
  output: {
    path: path.join(packageRoot, `dist`, `utils`, `page-ssr-module`),
    filename: `lambda.js`,
    libraryTarget: `commonjs`,
  },
  resolve: {
    extensions: [`.ts`, `.mjs`, `.js`, `.json`],
  },
  // written out next to the bundle by `bundle-webpack.ts` at `gatsby build`
  // time, so they have to stay runtime requires
  externals: [`./index`, `../query-engine`],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: require.resolve(`babel-loader`),
          options: { cwd: packageRoot },
        },
      },
      {
        test: /\.m?js$/,
        type: `javascript/auto`,
        resolve: {
          byDependency: {
            esm: {
              fullySpecified: false,
            },
          },
        },
      },
    ],
  },
})

const isWatch = process.argv.includes(`--watch`)

function onBuild(err, stats) {
  if (err) {
    console.error(err)
  } else if (stats?.hasErrors()) {
    console.error(stats.toString({ colors: true, all: false, errors: true }))
  } else {
    console.log(stats.toString({ colors: true, preset: `minimal` }))
    return
  }

  if (!isWatch) {
    process.exit(1)
  }
}

if (isWatch) {
  compiler.watch({}, onBuild)
} else {
  compiler.run((err, stats) => {
    compiler.close(closeErr => onBuild(err || closeErr, stats))
  })
}
