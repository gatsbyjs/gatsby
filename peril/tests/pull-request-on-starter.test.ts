jest.mock("danger", () => jest.fn())
import * as danger from "danger"

const dm = danger as any

import {
  closePullRequestAndComment,
  comment,
} from "../rules/pull-request-on-starter"

beforeEach(() => {
  dm.danger = {
    github: {
      thisPR: {
        owner: "gatsbyjs",
        repo: "peril-gatsbyjs",
        number: 1,
      },
      pr: {
        user: {
          login: "someUser",
        },
      },
      api: {
        pullRequests: {
          update: jest.fn(),
        },
      },
    },
  }
  dm.markdown = jest.fn()
})

describe("an opened pull request", () => {
  it("was closed with a comment", async () => {
    await closePullRequestAndComment()

    expect(dm.danger.github.api.pullRequests.update).toBeCalledWith({
      owner: "gatsbyjs",
      repo: "peril-gatsbyjs",
      number: 1,
      state: "closed",
    })

    expect(dm.markdown).toBeCalledWith(comment("someUser"))
  })
})
