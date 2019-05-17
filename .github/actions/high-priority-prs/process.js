const _ = require(`lodash`)
const { WebClient } = require("@slack/web-api")
const prMessage = require(`./pr-message`)
const { Toolkit } = require("actions-toolkit")
const tools = new Toolkit({
  secrets: ["SLACK_TOKEN", "SLACK_CHANNEL_ID"],
})

const token = process.env.SLACK_TOKEN
const web = new WebClient(token)

// const filecontents = tools.getFile(".github/actions/gatsby-pr-bot/data.json")
// const data = JSON.parse(filecontents)

const maintainers = {
  "https://github.com/wardpeet": {
    name: "Ward Peeters",
    slackUsername: "@Ward",
  },
  "https://github.com/KyleAMathews": {
    name: "Kyle Mathews",
    slackUsername: "@kylemathews",
  },
  "https://github.com/pieh": {
    name: "Michał Piechowiak",
    slackUsername: "@pieh",
  },
  "https://github.com/DSchau": {
    name: "Dustin Schau",
    slackUsername: "@dustin",
  },
  "https://github.com/prestonso": {
    name: "Preston So",
    slackUsername: "@prestonso",
  },
  "https://github.com/sidharthachatterjee": {
    name: "Sidhartha Chatterjee",
    slackUsername: "@Sid",
  },
  "https://github.com/jlengstorf": {
    name: "Jason Lengstorf",
    slackUsername: "@jlengstorf",
  },
  "https://github.com/marcysutton": {
    name: "Marcy Sutton",
    slackUsername: "@marcysutton",
  },
  "https://github.com/ChristopherBiscardi": {
    name: "Chris Biscardi",
    slackUsername: "@biscarch",
  },
  "https://github.com/LekoArts": {
    name: "Lennart Jörgens",
    slackUsername: "@lennart",
  },
  "https://github.com/freiksenet": {
    name: "Mikhail Novikov",
    slackUsername: "@freiksenet",
  },
  "https://github.com/stefanprobst": {
    name: "Stefan Probst",
    slackUsername: "@stefanprobst",
  },
  "https://github.com/davidbailey00": {
    name: "David Bailey",
    slackUsername: "@David",
  },
  "https://github.com/m-allanson": {
    name: "Mike Allanson",
    slackUsername: "@m-allanson",
  },
  "https://github.com/shannonbux": {
    name: "Shannon Soper",
    slackUsername: "@shannonsoper",
  },
  "https://github.com/calsam": {
    name: "Sam Bhagwat",
    slackUsername: "@Sam Bhagwat",
  },
  "https://github.com/fk": {
    name: "Florian Kissling",
    slackUsername: "@fk",
  },
}

module.exports = data => {
  const prs = data.repository.pullRequests

  // Total PRs
  // console.log(`total PRS`, prs.totalCount)

  const counts = { yes: 0, no: 0 }

  const queues = {
    noMaintainers: [],
    commitsSinceLastComment: [],
  }

  // Combine comments and reviews (for us, they're the same).
  prs.nodes.forEach(pr => {
    pr.comments.nodes = pr.comments.nodes.concat(pr.reviews.nodes)
  })

  // Create list of participants
  prs.nodes.forEach(pr => {
    pr.participants = {}
    pr.participants.nodes = _.uniqBy(
      pr.comments.nodes
        .filter(c => c.author.url != pr.author.url)
        .map(c => {
          return { url: c.author.url }
        }),
      node => node.url
    )
  })

  // Set the updatedAt value by the time of the last commit/comment
  prs.nodes.forEach(pr => {
    let values = []

    const latestComment = _.maxBy(pr.comments.nodes, c => c.createdAt)
    const latestCommit = _.maxBy(pr.commits.nodes, n => n.commit.authoredDate)

    if (latestCommit) {
      values.push(latestCommit.commit.authoredDate)
    }
    if (latestComment) {
      values.push(latestComment.createdAt)
    }

    pr.updatedAt = _.max(values)
  })

  // Figure out if any participants are core maintainers
  prs.nodes.forEach(pr => {
    const didParticipate = pr.participants.nodes.some(
      person => maintainers[person.url]
    )
    if (didParticipate) {
      counts.yes += 1
    } else {
      queues.noMaintainers.push(pr)
      counts.no += 1
    }
  })

  // What PRs have commits (aka activity) since the last comment by
  // a maintainer.
  prs.nodes.forEach(pr => {
    const lastComment = _.get(
      _.maxBy(pr.comments.nodes, n => n.createdAt),
      `createdAt`
    )
    const lastCommit = pr.commits.nodes[0].commit.authoredDate
    commitNewerThanComment = lastComment < lastCommit

    if (
      commitNewerThanComment &&
      !queues.noMaintainers.some(p => p.url === pr.url)
    ) {
      queues.commitsSinceLastComment.push(pr)
    }
  })

  // Sort awaiting responses by how long since they were last updated.
  queues.commitsSinceLastComment = _.sortBy(
    queues.commitsSinceLastComment,
    pr => pr.updatedAt
  )

  const report = prMessage(queues, maintainers)

  tools.log.info(JSON.stringify(report, null, 4))
  tools.log.info(`No review by maintainers:`, queues.noMaintainers.length)
  tools.log.info(
    `Needs Review for new activity`,
    queues.commitsSinceLastComment.length
  )
  ;(async () => {
    try {
      // See: https://api.slack.com/methods/chat.postMessage
      const res = await web.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        blocks: report,
      })

      // `res` contains information about the posted message
      tools.log.success("Message sent: ", res.ts)
      tools.exit.success()
    } catch (error) {
      tools.log.fatal(error)
      tools.exit.failure()
    }
  })()
}
