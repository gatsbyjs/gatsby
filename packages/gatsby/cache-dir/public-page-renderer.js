const preferDefault = m => (m && m.default) || m

if (process.env.NODE_ENV !== `production`) {
  module.exports = preferDefault(require(`./public-page-renderer-dev`))
} else if (process.env.BUILD_STAGE === `build-javascript`) {
  module.exports = preferDefault(require(`./public-page-renderer-prod`))
} else {
  module.exports = () => null
}
