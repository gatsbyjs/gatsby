const moment = require(`moment`)
const _ = require(`lodash`)
const arrayToSentence = require(`array-to-sentence`)

module.exports = (queues, maintainers) => {
  const report = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "Hi, this is your friendly PR BOT with the latest report on which PRs most need help",
      },
    },
  ]

  Object.keys(queues).forEach(key => {
    report.push({
      type: "divider",
    })

    // Add message
    const message =
      key === `noMaintainers`
        ? `[${queues[key].length}] *_PRs with no responses from maintainers_*`
        : `[${queues[key].length}] *_PRs with new commits awaiting review_*`
    report.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: message,
      },
    })
    let text = ``
    queues[key].slice(0, 14).map((pr, i) => {
      const participated = _.uniqBy(pr.comments.nodes, c => c.author.url)
        .filter(comment => maintainers[comment.author.url])
        .map(comment => `<${maintainers[comment.author.url].slackUsername}>`)

      const participatedStr =
        participated.length > 0
          ? "— commented: " + arrayToSentence(participated)
          : ""

      console.log({ participated })

      text += `${i + 1 + `. `}*<${pr.url}|${pr.title}>* — _created_ ${moment(
        pr.createdAt
      ).fromNow()} — _updated_ ${moment(
        pr.updatedAt
      ).fromNow()}${participatedStr}\n`
    })

    if (text === ``) {
      text = "There's none! Great job!"
    }

    report.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text,
      },
    })
  })
  return report
}
