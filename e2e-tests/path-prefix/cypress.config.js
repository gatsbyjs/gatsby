const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000/blog`,
    specPattern: `cypress/integration/*.{js,ts}`
  },
})