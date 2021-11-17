const core = require("@actions/core")
const slackMessage = "./slack-message"

function formatIssues(issues) {
  return issues.map(entry => ({
    title: entry.title,
    url: `https://github.com/gatsbyjs/gatsby/issues/${entry.number}`
  }))
}

try {
  const staledIssuesInput = core.getInput('staled-issues-prs')
  const closedIssuesInput = core.getInput('closed-issues-prs')

  const staledIssues = formatIssues(staledIssuesInput)
  const closedIssues = formatIssues(closedIssuesInput)

  const staleSlack = slackMessage(staledIssues, 'stale')
  const closedSlack = slackMessage(closedIssues, 'closed')

  const welcomeMessage = {
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        "Hi, this is your friendly Stale Action BOT with the latest stale & closed issues",
    },
  }

  const blocks = [welcomeMessage, ...staleSlack, ...closedSlack]

  core.setOutput('blocks', blocks)
} catch (error) {
  core.setFailed(error.message)
}