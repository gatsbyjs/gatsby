const isCI = require(`is-ci`)

module.exports = {
  server: {
    command: `npm run serve`,
    port: 9000,
  },
  launch: {
    headless: isCI,
  },
}
