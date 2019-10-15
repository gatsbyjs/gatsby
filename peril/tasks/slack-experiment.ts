import { danger, peril } from "danger"
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/client"

const org = "gatsbyjs"
const label = "stale?"

/**
 * A task that accepts Slack incoming webhook data
 * and sends a message into the Artsy Dev chat room.
 *
 * The full API docs for the syntax of the expected data
 * can be found: https://slackapi.github.io/node-slack-sdk/reference/IncomingWebhook
 *
 * Usage in a Dangerfile:
 *
    const message = {
      unfurl_links: false,
      attachments: [
        {
          pretext: "We can throw words around like two hundred million galaxies",
          color: "good",
          title: issue.title,
          title_link: issue.html_url,
          author_name: issue.user.login,
          author_icon: issue.user.avatar_url,
        },
      ],
    }
    peril.runTask("slack-dev-channel", "in 5 minutes", message)
 */

/**
 * The default, send a slack message with some data that's come in
 * this is also usable as a task
 */

const slackData = async (data: IncomingWebhookSendArguments) => {
  if (!data) {
    console.log(
      "No data was passed to slack-dev-channel, so a message will not be sent."
    )
  } else {
    const url = peril.env.SLACK_WEBHOOK_URL || ""
    const webhook = new IncomingWebhook(url)
    await webhook.send(data)
  }
}

/**
 * Send a slack message to the dev channel in Artsy
 * @param message the message to send to #dev
 */
const slackMessage = async (message: string) => {
  const data = {
    unfurl_links: false,
    attachments: [
      {
        color: "good",
        title: message,
      },
    ],
  }
  await slackData(data)
}
export interface Result {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: any
  labels: any[]
  state: string
  assignee?: any
  milestone?: any
  comments: number
  created_at: Date
  updated_at: Date
  closed_at?: any
  pull_request: any
  body: string
  score: number
}

// https://developer.github.com/v3/search/#search-issues

export default async () => {
  const api = danger.github.api
  const staleQuery = `org:${org} label:${label} state:open`
  const searchResponse = await api.search.issues({ q: staleQuery })
  const items = searchResponse.data.items

  // Bail early
  if (items.length === 0) {
    await slackMessage("No stale issues found.")
    return
  }

  // Convert the open issues into attachments
  const attachments = items.map((r: Result) => ({
    fallback: "Required plain-text summary of the attachment.",
    color: "#36a64f",
    author_name: r.user.login,
    author_link: r.user.html_url,
    author_icon: r.user.avatar_url,
    title: r.title,
    title_link: r.html_url,
  }))

  const text = `There are ${items.length} stale issues:`
  await slackData({
    text,
    attachments,
    unfurl_links: false,
  })
}
