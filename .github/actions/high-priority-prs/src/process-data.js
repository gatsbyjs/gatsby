const _ = require(`lodash`)
const { WebClient } = require("@slack/web-api")
const prMessage = require(`./pr-message`)
const { Toolkit } = require("actions-toolkit")
const parseISO = require("date-fns/parseISO")
const isBefore = require("date-fns/isBefore")
const differenceInDays = require("date-fns/differenceInDays")
const tools = new Toolkit({
  secrets: [
    "PERSONAL_GITHUB_TOKEN",
    "SLACK_TOKEN",
    "SLACK_CORE_CHANNEL_ID",
    "SLACK_LEARNING_CHANNEL_ID",
  ],
})

const token = process.env.SLACK_TOKEN
const web = new WebClient(token)

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
  "https://github.com/gillkyle": {
    name: "Kyle Gill",
    slackUsername: "@kylegill",
  },
  "https://github.com/amberleyromo": {
    name: "Amberley Romo",
    slackUsername: "@amberley",
  },
}

const ignoreMessages = ["Merge branch 'master'", "Merge remote-tracking branch"]

const processData = (data, now = new Date()) => {
  const prs = data.repository.pullRequests

  // fs.writeFileSync("./data.json", JSON.stringify(data))
  // Total PRs
  // console.log(`total PRS`, prs.totalCount)

  const counts = { yes: 0, no: 0 }

  const queues = {
    noMaintainers: [],
    commitsSinceLastComment: [],
    lonelyPrs: [],
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
        .filter(c => {
          return c.author && pr.author && c.author.url != pr.author.url
        })
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
    const authorUrl = pr.author ? pr.author.url : ""
    const botUrl = "https://github.com/apps/gatsbot"

    const reviewList = pr.comments.nodes.filter(
      x => x.author && x.author.url !== authorUrl && x.author.url !== botUrl
    )
    const lastComment = _.get(
      _.maxBy(reviewList, n => n.createdAt),
      `createdAt`
    )

    let commitMessages = []
    pr.commits.nodes.forEach(c => {
      const message = c.commit.message
      if (ignoreMessages.every(im => message.indexOf(im) === -1)) {
        commitMessages.push(c)
      } else {
        commitMessages = []
      }
    })

    commitMessages = commitMessages.filter(
      c => lastComment < c.commit.authoredDate
    )
    commitNewerThanComment = commitMessages.length !== 0

    if (
      commitNewerThanComment &&
      !queues.noMaintainers.some(p => p.url === pr.url)
    ) {
      queues.commitsSinceLastComment.push(pr)
    }
  })

  // lonely PRs - open PRs that haven't been updated for at least 30 days
  const DAYS_TO_LONELY = 30
  const prIsLonely = pr =>
    differenceInDays(now, parseISO(pr.updatedAt)) > DAYS_TO_LONELY
  const prsByDate = (a, b) =>
    isBefore(parseISO(a.updatedAt), parseISO(b.updatedAt)) ? -1 : 1
  const lonely = prs.nodes.filter(prIsLonely).sort(prsByDate)
  queues.lonelyPrs.push(...lonely)

  // Sort awaiting responses by how long since they were last updated.
  queues.commitsSinceLastComment = _.sortBy(
    queues.commitsSinceLastComment,
    pr => pr.updatedAt
  )

  return queues
}

const report = ({ queues, channelId }) => {
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
        channel: channelId,
        blocks: report,
      })

      // When ok is false we should throw
      // @see https://api.slack.com/methods/chat.postMessage#response
      if (!res.ok) {
        throw new Error(res.error)
      }

      // `res` contains information about the posted message
      tools.log.success("Message sent: ", res.ts)
      tools.exit.success()
    } catch (error) {
      tools.log.fatal(error)
      tools.exit.failure()
    }
  })()
}

module.exports = {
  processData,
  report,
  ignoreMessages,
  maintainers,
}
