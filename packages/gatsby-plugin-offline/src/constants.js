exports.defaultRuntimeCachingHandlers = [
  {
    // Use cacheFirst since these don't need to be revalidated (same RegExp
    // and same reason as above)
    urlPattern: /(\.js$|\.css$|static\/)/,
    handler: `CacheFirst`,
  },
  {
    // page-data.json files, static query results and app-data.json
    // are not content hashed
    urlPattern: /^https?:.*\/page-data\/.*\.json/,
    handler: `StaleWhileRevalidate`,
  },
  {
    // Add runtime caching of various other page resources
    urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|json|css)$/,
    handler: `StaleWhileRevalidate`,
  },
  {
    // Google Fonts CSS (doesn't end in .css so we need to specify it)
    urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
    handler: `StaleWhileRevalidate`,
  },
]
