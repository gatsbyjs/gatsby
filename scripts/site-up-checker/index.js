const request = require(`request-promise`)
const Webhook = require(`webhook-discord`)
const Discord = require(`discord.js`)
const _ = require(`lodash`)

const client = new Discord.Client()

client.login(process.env.CLIENT_LOGIN)

const usersToAlert = [`103313968377909248`]
const usersDMChannels = []
client.on(`ready`, () => {
  console.log(`client ready`)
  client.users
    .filter(u => _.includes(usersToAlert, u.id))
    .forEach(userObject => {
      console.log(userObject)
      userObject.createDM().then(dmChannel => usersDMChannels.push(dmChannel))
    })
})

const webhook = new Webhook(process.env.WEBHOOK_URL)

const checkWebsite = async site => {
  try {
    const { statusCode } = await request({
      uri: site,
      resolveWithFullResponse: true,
      method: `GET`,
    })
    if (statusCode === 200) {
      console.log(`${new Date().toJSON()}: ${site} is up`)
    }
  } catch (e) {
    console.log(`fail`, e)

    // Alert channel.
    webhook.error(`Gatsby bot`, `A Gatsby site is down ${site}`)

    // Alert admins over DM
    usersDMChannels.forEach(chan =>
      chan.send(`A Gatsby website is down! ${site}`)
    )
  }
}

const main = () => {
  const websites = [
    `https://www.gatsbyjs.com`,
    `https://gatsbygram.gatsbyjs.org`,
    `https://using-drupal.gatsbyjs.org`,
  ]

  // Run immediately.
  websites.forEach(w => checkWebsite(w))

  // Check each website every 60 seconds.
  setInterval(() => {
    websites.forEach(w => checkWebsite(w))
  }, 60000)
}

main()
