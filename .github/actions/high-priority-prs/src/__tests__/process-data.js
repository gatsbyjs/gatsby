const { processData } = require("../process-data")
const fs = require("fs")
const path = require("path")
const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "data.json"), `utf-8`)
)

test("Gets PRs that have not been updated in at least 30 days, sorted by oldest first", () => {
  const now = new Date(`2019-06-05T13:49:58Z`)
  const lonelyPrDates = processData(fixture, now).lonelyPrs.map(
    pr => pr.updatedAt
  )
  expect(lonelyPrDates).toMatchSnapshot()
})
