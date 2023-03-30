const { defineConfig } = require(`cypress`)

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:8000`,
    specPattern: `cypress/integration/*.{js,ts}`
  },
  env: {
    "GATSBY_COMMAND": `develop`
  }
})