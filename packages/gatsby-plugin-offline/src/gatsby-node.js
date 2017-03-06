const precache = require(`sw-precache`)
const path = require(`path`)

exports.createPages = () => [
  {
    path: `/offline-plugin-app-shell-fallback/`,
    component: path.resolve(`${__dirname}/app-shell.js`),
  },
]

exports.postBuild = () => {
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
    cacheId: `gatsby-plugin-offline`,
    // Do cache bust JS URLs until can figure out how to make Webpack's
    // URLs truely content-addressed.
    dontCacheBustUrlsMatching: /(.\w{8}.woff2)/, //|-\w{20}.js)/,
    runtimeCaching: [
      {
        // Add runtime caching of images.
        urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff)$/,
        handler: `fastest`,
      },
    ],
    skipWaiting: false,
  }

  return precache.write(`public/sw.js`, options)
}
