const { processData, maintainers } = require("../process-data")
const report = require("../pr-message")
const fs = require("fs")
const path = require("path")
const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "data.json"), `utf-8`)
)

test("Creates a correctly formatted Slack message", () => {
  const now = new Date(`2019-06-05T13:49:58Z`)
  const queues = processData(fixture, now)
  const slackMessage = report(queues, maintainers, now)
  expect(slackMessage).toMatchSnapshot()

  // See https://api.slack.com/tools/block-kit-builder
  // console.log(JSON.stringify(slackMessage, null, 2))
})
