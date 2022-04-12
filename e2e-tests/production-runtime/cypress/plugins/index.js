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
    } else if (
      browser.name === `chrome` &&
      process.env.CYPRESS_CONNECTION_TYPE === `bot`
    ) {
      args.push(
        `--user-agent="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"`
      )
    }

    return args
  })

  on(`task`, Object.assign({}, blockResources))
}
