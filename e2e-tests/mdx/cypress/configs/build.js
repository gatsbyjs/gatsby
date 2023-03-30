const { defineConfig } = require(`cypress`)

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:9000`,
    specPattern: `cypress/integration/*.{js,ts}`,
  },
  env: {
    "GATSBY_COMMAND": `build`
  }
})