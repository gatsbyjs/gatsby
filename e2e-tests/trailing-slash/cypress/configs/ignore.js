const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: [`cypress/integration/ignore.js`, `cypress/integration/functions.js`, `cypress/integration/static.js`]
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})