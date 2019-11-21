jest.mock("danger", () => jest.fn())
import { IssueComment } from "github-webhook-event-types"
import * as danger from "danger"
const dm = danger as any

import { notStale, STALE_LABEL } from "../rules/not-stale"

beforeEach(() => {
  const github = ({
    repository: {
      name: "gatsby",
      owner: {
        login: "gatsbyjs",
      },
    },
    issue: {
      labels: [],
      number: 100,
    },
    api: {
      issues: {
        removeLabel: jest.fn(),
      },
    },
  } as any) as IssueComment
  dm.danger = { github }
})

describe("a new issue comment", () => {
  it("removes stale? label", async () => {
    dm.danger.github.issue.labels = [
      { name: "foo" },
      { name: "stale?" },
      { name: "bar" },
    ]
    await notStale()
    expect(dm.danger.github.api.issues.removeLabel).toBeCalledWith({
      repo: "gatsby",
      owner: "gatsbyjs",
      number: 100,
      name: encodeURIComponent(STALE_LABEL),
    })
  })
  it("does nothing without a stale? label", () => {
    return notStale().then(() => {
      expect(dm.danger.github.api.issues.removeLabel).not.toHaveBeenCalled()
    })
  })
})
