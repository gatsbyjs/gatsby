const blockResources = require(`./block-resources`)

module.exports = (on, _config) => {
  on(`before:browser:launch`, (browser = {}, launchOptions) => {
    if (
      browser.name === `chrome` &&
      process.env.CYPRESS_CONNECTION_TYPE === `bot`
    ) {
      launchOptions.args.push(
        `--user-agent="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"`
      )
    }

    return launchOptions
  })

  on(`task`, Object.assign({}, blockResources))
}
