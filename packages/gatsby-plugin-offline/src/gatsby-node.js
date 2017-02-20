const Promise = require(`bluebird`)
const precache = require(`sw-precache`)
const path = require(`path`)

exports.createPages = () => [
  {
    path: `/offline-plugin-app-shell-fallback/`,
    component: path.resolve(`${__dirname}/app-shell.js`),
  },
]

exports.postBuild = () => new Promise((resolve, reject) => {
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
    dontCacheBustUrlsMatching: /(.*.woff2|.*.js)/,
    runtimeCaching: [
      {
        urlPattern: /.*.png/,
        handler: `fastest`,
      },
      {
        urlPattern: /.*.jpg/,
        handler: `fastest`,
      },
      {
        urlPattern: /.*.jpeg/,
        handler: `fastest`,
      },
    ],
    skipWaiting: false,
  }

  precache.write(`public/sw.js`, options, err => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})
