import { danger, peril } from "danger"
import * as octokit from "@octokit/rest"

const ACCEPTABLE_MERGEABLE_STATES = [`clean`, `unstable`]

const checkPRConditionsAndMerge = async ({
  number,
  owner,
  repo,
}: {
  number: number
  owner: string
  repo: string
}) => {
  // we need to check if "bot: merge on green" label is applied and PR is mergeable (checks are green and have approval)

  const userAuthedAPI = new octokit()
  userAuthedAPI.authenticate({
    type: "token",
    token: peril.env.GITHUB_ACCESS_TOKEN,
  })

  const pr = await userAuthedAPI.pullRequests.get({ number, owner, repo })

  const isMergeButtonGreen = ACCEPTABLE_MERGEABLE_STATES.includes(
    pr.data.mergeable_state
  )

  const hasMergeOnGreenLabel = pr.data.labels.some(
    label => label.name === `bot: merge on green`
  )

  console.log({
    number,
    owner,
    repo,
    isMergeButtonGreen,
    hasMergeOnGreenLabel,
    mergeable_state: pr.data.mergeable_state,
  })

  if (isMergeButtonGreen && hasMergeOnGreenLabel) {
    await userAuthedAPI.pullRequests.merge({
      merge_method: `squash`,
      commit_title: `${pr.data.title} (#${number})`,
      number,
      owner,
      repo,
    })
  }
}

export const mergeOnGreen = async () => {
  try {
    if (danger.github.action === `completed` && danger.github.check_suite) {
      // this is for check_suite.completed

      // search returns first 100 results, we are not handling pagination right now
      // because it's unlikely to get more 100 results for given sha
      const results = await danger.github.api.search.issues({
        q: `${danger.github.check_suite.head_sha} is:open repo:${danger.github.repository.owner.login}/${danger.github.repository.name}`,
      })

      let i = 0
      while (i < results.data.items.length) {
        const pr = results.data.items[i]
        i++
        await checkPRConditionsAndMerge({
          number: pr.number,
          owner: danger.github.repository.owner.login,
          repo: danger.github.repository.name,
        })
      }
    } else if (danger.github.state === `success` && danger.github.commit) {
      // this is for status.success

      // search returns first 100 results, we are not handling pagination right now
      // because it's unlikely to get more 100 results for given sha
      const results = await danger.github.api.search.issues({
        q: `${danger.github.commit.sha} is:open repo:${danger.github.repository.owner.login}/${danger.github.repository.name}`,
      })

      let i = 0
      while (i < results.data.items.length) {
        const pr = results.data.items[i]
        i++
        await checkPRConditionsAndMerge({
          number: pr.number,
          owner: danger.github.repository.owner.login,
          repo: danger.github.repository.name,
        })
      }
    } else if (
      danger.github.action === `submitted` &&
      danger.github.pull_request
    ) {
      // this is for pull_request_review.submitted
      await checkPRConditionsAndMerge({
        number: danger.github.pull_request.number,
        repo: danger.github.pull_request.base.repo.name,
        owner: danger.github.pull_request.base.repo.owner.login,
      })
    } else {
      // this is for pull_request.labeled
      await checkPRConditionsAndMerge({
        number: danger.github.pr.number,
        repo: danger.github.pr.base.repo.name,
        owner: danger.github.pr.base.repo.owner.login,
      })
    }
  } catch (e) {
    console.log(e)
  }
}

export default async () => {
  await mergeOnGreen()
}
