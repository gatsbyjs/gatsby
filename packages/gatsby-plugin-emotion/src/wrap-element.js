const React = require(`react`)
const { cache } = require(`emotion`)
const { CacheProvider } = require(`@emotion/core`)

exports.wrapElement = element => (
  <CacheProvider value={cache}>{element}</CacheProvider>
)
