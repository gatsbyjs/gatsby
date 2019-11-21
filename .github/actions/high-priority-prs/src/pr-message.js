const _ = require(`lodash`)
const arrayToSentence = require(`array-to-sentence`)
const distanceInWords = require(`date-fns/distance_in_words`)
const parse = require(`date-fns/parse`)

// Format a message for Slack's block kit: https://api.slack.com/tools/block-kit-builder
module.exports = (queues, maintainers, now = new Date()) => {
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
    const messages = {
      noMaintainers: `[${
        queues[key].length
      }] *_PRs with no responses from maintainers_*`,
      commitsSinceLastComment: `[${
        queues[key].length
      }] *_PRs with new commits awaiting review_*`,
      lonelyPrs: `[${
        queues[key].length
      }] *_PRs that were updated more than 30 days ago_*`,
    }

    report.push({
      type: "divider",
    })

    report.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: messages[key],
      },
    })

    let text = ``
    queues[key].slice(0, 14).map((pr, i) => {
      const participated = _.uniqBy(pr.comments.nodes, c =>
        c.author ? c.author.url : ""
      )
        .filter(comment => {
          return comment.author ? maintainers[comment.author.url] : false
        })
        .map(comment => `<${maintainers[comment.author.url].slackUsername}>`)

      const participatedStr =
        participated.length > 0
          ? "— commented: " + arrayToSentence(participated)
          : ""

      // console.log({ participated })
      const createdAgo = distanceInWords(parse(pr.createdAt), now)
      const updatedAgo = distanceInWords(parse(pr.updatedAt), now)
      text += `${i + 1 + `. `}*<${pr.url}|${
        pr.title
      }>* — _created_ ${createdAgo} ago — _updated_ ${updatedAgo} ago ${participatedStr}\n`
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
