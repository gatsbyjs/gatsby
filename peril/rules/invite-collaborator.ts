import { danger } from "danger"

const comment = (username: string) => `
Holy buckets, @${username} — we just merged your PR to Gatsby! 💪💜

Gatsby is built by awesome people like you. Let us say “thanks” in two ways:

 1.  **We’d like to send you some Gatsby swag.** As a token of our appreciation, you can go to the [Gatsby Swag Store][store] and log in with your GitHub account to get a coupon code good for one free piece of swag. We’ve got Gatsby t-shirts, stickers, hats, scrunchies, and much more. (You can also unlock _even more_ free swag with 5 contributions — wink wink nudge nudge.) See [gatsby.dev/swag](https://gatsby.dev/swag) for details.
 2.  **We just invited you to join the Gatsby organization on GitHub.** This will add you to our team of maintainers. Accept the invite by visiting https://github.com/orgs/gatsbyjs/invitation. By joining the team, you’ll be able to label issues, review pull requests, and merge approved pull requests.

If there’s anything we can do to help, please don’t hesitate to reach out to us: tweet at [@gatsbyjs][twitter] and we’ll come a-runnin’.

Thanks again!

[store]: https://store.gatsbyjs.org
[twitter]: https://twitter.com/gatsbyjs
`

export const inviteCollaborator = async () => {
  const gh = danger.github
  const api = gh.api

  // Details about the repo.
  const owner = gh.thisPR.owner
  const repo = gh.thisPR.repo
  const number = gh.thisPR.number

  // Details about the collaborator.
  const username = gh.pr.user.login

  // Check whether or not we’ve already invited this contributor.
  try {
    const inviteCheck = (await api.orgs.getTeamMembership({
      team_id: "1942254",
      username,
    } as any)) as any
    const isInvited = inviteCheck.headers.status !== "404"

    // If we’ve already invited them, don’t spam them with more messages.
    if (isInvited) {
      console.log(
        `@${username} has already been invited to this org. Doing nothing.`
      )
      return
    }
  } catch (_) {
    // If the user hasn’t been invited, the invite check throws an error.
  }

  try {
    const invite = await api.orgs.addTeamMembership({
      // ID of the @gatsbyjs/maintainers team on GitHub
      team_id: "1942254",
      username,
    } as any)

    if (invite.data.state === "active") {
      console.log(
        `@${username} is already a ${invite.data.role} for this team.`
      )
    } else {
      console.log(`We’ve invited @${username} to join this team.`)
    }
  } catch (err) {
    console.log("Something went wrong.")
    console.log(err)
    return
  }

  // For new contributors, roll out the welcome wagon!
  await api.issues.createComment({
    owner,
    repo,
    number,
    body: comment(username),
  })
}

export default async () => {
  await inviteCollaborator()
}
