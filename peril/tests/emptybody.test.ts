jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { emptybody } from "../rules/emptybody"

beforeEach(() => {
  dm.danger = {
    github: {
      repository: {
        owner: "gatsbyjs",
      },
      issue: {
        user: {
          login: "someUser",
        },
      },
    },
  }

  dm.markdown = jest.fn()
})

describe("a new issue", () => {
  it("has no content in the body", async () => {
    dm.danger.github.issue.body = ""

    await emptybody()

    expect(dm.markdown).toBeCalled()
  })
  it("only contains whitespace in body", async () => {
    dm.danger.github.issue.body = "\n"
    await emptybody()

    expect(dm.markdown).toBeCalled()
  })
  it("has a body with content", async () => {
    dm.danger.github.issue.body = "Moya is awesome"
    await emptybody()
    expect(dm.markdown).not.toBeCalled()
  })
})
