const messages = {
  stale: {
    found: "*_Issues were marked as stale_*",
    empty: "No issues were marked as stale"
  },
  closed: {
    found: "*_Issues were closed_*",
    empty: "There are none! Great job!"
  }
}

/**
 * Format a list of issues to Slack's block kit
 * @see https://api.slack.com/tools/block-kit-builder
 * @param queue
 * @param type - Which type of issue. stale | closed
 */
const slackMessage = (queue, type) => {
  const report = []

  report.push({
    type: "divider",
  })

  report.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `[${queue.length}] ${messages[type].found}`,
    },
  })

  let text = ``

  queue.map((issue, i) => {
    text += `${i + 1 + `. `}<${issue.url}|${issue.title}>\n`
  })

  if (text === ``) {
    text = messages[type].empty
  }

  report.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text,
    },
  })

  return report
}

module.exports = slackMessage