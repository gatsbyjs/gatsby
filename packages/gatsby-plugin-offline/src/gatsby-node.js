const precache = require(`sw-precache`)
const path = require(`path`)
const slash = require(`slash`)
const _ = require(`lodash`)

exports.createPages = ({ boundActionCreators }) => {
  if (process.env.NODE_ENV === `production`) {
    const { createPage } = boundActionCreators
    createPage({
      path: `/offline-plugin-app-shell-fallback/`,
      component: slash(path.resolve(`${__dirname}/app-shell.js`)),
    })
  }
}

exports.postBuild = (args, pluginOptions) => {
  const rootDir = `public`

  const options = {
    staticFileGlobs: [
      `${rootDir}/**/*.{js,woff2}`,
      `${rootDir}/index.html`,
      `${rootDir}/manifest.json`,
      `${rootDir}/offline-plugin-app-shell-fallback/index.html`,
    ],
    stripPrefix: rootDir,
    navigateFallback: `/offline-plugin-app-shell-fallback/index.html`,
    // Only match URLs without extensions.
    // So example.com/about/ will pass but
    // example.com/cheeseburger.jpg will not.
    // We only want the service worker to handle our "clean"
    // URLs and not any files hosted on the site.
    //
    // Regex from http://stackoverflow.com/a/18017805
    navigateFallbackWhitelist: [/^.*[^.]{5}$/],
    cacheId: `gatsby-plugin-offline`,
    // Do cache bust JS URLs until can figure out how to make Webpack's
    // URLs truely content-addressed.
    dontCacheBustUrlsMatching: /(.\w{8}.woff2)/, // |-\w{20}.js)/,
    runtimeCaching: [
      {
        // Add runtime caching of images.
        urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff)$/,
        handler: `fastest`,
      },
    ],
    skipWaiting: false,
  }

  const combinedOptions = _.defaults(pluginOptions, options)

  return precache.write(`public/sw.js`, combinedOptions)
}
