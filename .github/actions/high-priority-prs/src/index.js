const { Toolkit } = require("actions-toolkit")
const tools = new Toolkit()
const fetch = require("./fetch.js")
const { processData, report } = require("./process-data.js")
const { filter } = require("./filter.js")

const teams = [
  {
    id: `MDQ6VGVhbTI5MzQzMzQ=`,
    name: `core`,
    channelId: process.env.SLACK_CORE_CHANNEL_ID,
  },
  {
    id: `MDQ6VGVhbTMzMDc4MzY=`,
    name: `learning`,
    channelId: process.env.SLACK_LEARNING_CHANNEL_ID,
  },
]

const start = async function () {
  const data = await fetch()
  if (data) {
    const queues = processData(data)
    await Promise.all(
      teams.map(team => {
        if (team.name === `core`) {
          // send report of all PRs (without filtering) to Core
          tools.log.info(`-> Reporting for ${team.name} team`)
          return report({ queues, channelId: team.channelId })
        } else {
          // send filtered reports to respective teams
          tools.log.info(`-> Reporting for ${team.name} team`)
          return report(filter(queues, team))
        }
      })
    )
  }
}

start()
