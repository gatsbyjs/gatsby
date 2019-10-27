const Octokit = require(`@octokit/rest`)

// We need to use the REST API because inviting to an organization
// isn't supported yet with the GraphQL API
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
  previews: [`hellcat-preview`],
})

/**
 * Invite the given list of usernames to the given organization.
 */
async function inviteMaintainers(org, usernames) {
  await Promise.all(
    usernames.map(async username => {
      await octokit.orgs.addOrUpdateMembership({
        org,
        username,
      })
    })
  )
}

module.exports = {
  inviteMaintainers,
}
