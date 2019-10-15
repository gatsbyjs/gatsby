jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import * as l from "../rules/labeler"
jest.spyOn(l, `logApiError`)

let apiError: any

beforeEach(() => {
  dm.danger = {
    github: {
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
          addLabels: jest.fn(),
        },
      },
    },
  }
})

describe("a new issue", () => {
  it("with question mark in a title", () => {
    dm.danger.github.issue.title =
      "Help - Has anyone hosted a gatsby.js site on Platform.sh?"
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).toBeCalledWith({
        repo: "gatsby",
        owner: "gatsbyjs",
        number: 100,
        labels: ["type: question or discussion"],
      })
    })
  })

  it("with existing labels", () => {
    dm.danger.github.issue.title = "How are labels handled?"
    dm.danger.github.issue.labels = [{ name: "good first issue" }]
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).toBeCalledWith({
        repo: "gatsby",
        owner: "gatsbyjs",
        number: 100,
        labels: ["good first issue", "type: question or discussion"],
      })
    })
  })

  it("starting with how", () => {
    dm.danger.github.issue.title =
      "How do you justify Gatsby’s bundle size to clients"
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).toBeCalledWith({
        repo: "gatsby",
        owner: "gatsbyjs",
        number: 100,
        labels: ["type: question or discussion"],
      })
    })
  })

  it("including tutorial", () => {
    dm.danger.github.issue.title = "Tutorial template + gold standard example"
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).toBeCalledWith({
        repo: "gatsby",
        owner: "gatsbyjs",
        number: 100,
        labels: ["type: documentation"],
      })
    })
  })

  it("including readme", () => {
    dm.danger.github.issue.title = "[v2] default starter: update README"
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).toBeCalledWith({
        repo: "gatsby",
        owner: "gatsbyjs",
        number: 100,
        labels: ["type: documentation"],
      })
    })
  })

  it("not recognised", () => {
    dm.danger.github.issue.title = "Supporting HSTS and how to HSTS preloading"
    return l.labeler().then(() => {
      expect(dm.danger.github.api.issues.addLabels).not.toBeCalled()
    })
  })

  describe("error logging", () => {
    beforeEach(() => {
      apiError = new Error("Mocked error")
      dm.danger.github.issue.title =
        "Help - Has anyone hosted a gatsby.js site on Platform.sh?"
      dm.danger.github.api.issues.addLabels = () => Promise.reject(apiError)
    })

    it("log error", () => {
      return l.labeler().then(() => {
        expect(l.logApiError).toHaveBeenCalledWith({
          action: "issues.addLabel",
          error: apiError,
          opts: {
            labels: ["type: question or discussion"],
            number: 100,
            owner: "gatsbyjs",
            repo: "gatsby",
          },
        })
      })
    })
  })
})
