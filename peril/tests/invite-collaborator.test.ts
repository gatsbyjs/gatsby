jest.mock("danger", () => jest.fn())
import * as danger from "danger"

const dm = danger as any

import { inviteCollaborator } from "../rules/invite-collaborator"

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
        orgs: {
          getTeamMembership: () => Promise.resolve({ meta: { status: "404" } }),
          addTeamMembership: jest.fn(() =>
            Promise.resolve({ data: { state: "pending" } })
          ),
        },
        issues: {
          createComment: jest.fn(),
        },
      },
    },
  }
})

describe("a closed pull request", () => {
  it("was merged and authored by a first-time contributor", async () => {
    dm.danger.github.pr.merged = true

    await inviteCollaborator()

    expect(dm.danger.github.api.issues.createComment).toBeCalled()
    expect(dm.danger.github.api.orgs.addTeamMembership).toBeCalled()
  })

  it("was merged and authored by an existing collaborator", async () => {
    dm.danger.github.pr.merged = true
    dm.danger.github.api.orgs.getTeamMembership = () =>
      Promise.resolve({ headers: { status: "204 No Content" } })

    await inviteCollaborator()

    expect(dm.danger.github.api.issues.createComment).not.toBeCalled()
  })

  it("does not comment if invitation failed", async () => {
    dm.danger.github.pr.merged = true
    dm.danger.github.api.orgs.addTeamMembership = () =>
      Promise.reject({ headers: { status: "422 Unprocessable Entity" } })

    await inviteCollaborator()

    expect(dm.danger.github.api.issues.createComment).not.toBeCalled()
  })
})
