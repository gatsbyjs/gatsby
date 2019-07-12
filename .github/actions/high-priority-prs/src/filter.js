const { Toolkit } = require("actions-toolkit")
const tools = new Toolkit()

const filter = (queues, team) => {
  tools.log.info(`Filtering PRs for team: ${team.name}`)

  // get requested reviews on the PR (decided by
  // the CODEOWNERS file) that match the team id
  let filteredQueues = {}
  Object.keys(queues).forEach(key => {
    filteredQueues[key] = queues[key].filter(pr => {
      return pr.reviewRequests.nodes
        .map(node => node.requestedReviewer.id)
        .includes(team.id)
    })
  })
  return { queues: filteredQueues, channelId: team.channelId }
}

module.exports = {
  filter,
}
