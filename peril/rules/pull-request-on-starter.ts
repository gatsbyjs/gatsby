import { danger, markdown } from "danger"

// TODO: Improve comment
export const comment = (username: string) => `
Hey, @${username}

Thank you for your pull request!

This repo is now a read-only repo that's synced from the main Gatsby monorepo at https://github.com/gatsbyjs/gatsby/.

We've moved all our starters to https://github.com/gatsbyjs/gatsby/tree/master/starters so changes to starters are made there.

Please checkout our contribution docs & recreate your PR against the starter directory in monorepo.

https://www.gatsbyjs.org/contributing/how-to-open-a-pull-request/

Thanks again!
`

export const closePullRequestAndComment = async () => {
  const gh = danger.github
  const api = gh.api

  // Details about the repo.
  const owner = gh.thisPR.owner
  const repo = gh.thisPR.repo
  const number = gh.thisPR.number

  // Details about the collaborator.
  const username = gh.pr.user.login

  // Leave a comment redirecting the collaborator to the monorepo
  markdown(comment(username))
  // Close this pull request
  await api.pullRequests.update({
    owner,
    repo,
    number,
    state: "closed",
  })
}

export default async () => {
  await closePullRequestAndComment()
}
