const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    specPattern: `cypress/integration/*.{js,ts}`
  },
  videoUploadOnPasses: false,
  chromeWebSecurity: false,
})