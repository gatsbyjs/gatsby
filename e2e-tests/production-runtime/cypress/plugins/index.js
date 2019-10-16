const compilationHash = require(`./compilation-hash`)
const blockResources = require(`./block-resources`)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on(`before:browser:launch`, (browser = {}, args) => {
    if (
      browser.name === `chrome` &&
      process.env.CYPRESS_CONNECTION_TYPE === `slow`
    ) {
      args.push(`--force-effective-connection-type=2G`)
    }

    return args
  })

  on(`task`, Object.assign({}, compilationHash, blockResources))
}
