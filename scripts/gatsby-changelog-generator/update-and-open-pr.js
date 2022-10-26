const execa = require(`execa`)
const { Octokit } = require(`@octokit/rest`)
const {
  getAllPackageNames,
  updateChangelog,
  changelogRelativePath,
} = require(`./generate`)

if (!process.env.GITHUB_BOT_AUTH_TOKEN) {
  throw new Error(`GITHUB_BOT_AUTH_TOKEN env var not set`)
}

async function run() {
  const base = `master`
  const branch = `changelog-update-${Date.now()}`

  const args = [`checkout`, `-b`, branch, `origin/${base}`, `--no-track`]
  const { stdout } = await execa(`git`, args)
  console.log(stdout)

  const updatedPackages = []
  for (const pkg of getAllPackageNames()) {
    try {
      const updated = await updateChangelog(pkg)
      if (updated) {
        updatedPackages.push(pkg)
      }
    } catch (e) {
      console.error(`${pkg}: ${e.stack}`)
    }
  }

  if (!updatedPackages.length) {
    console.log(`Nothing to do`)
    return
  }

  const commitMessage = `chore(changelogs): update changelogs`
  const updatedChangelogs = updatedPackages.map(pkg =>
    changelogRelativePath(pkg)
  )
  await execa(`npx`, [`prettier`, `--write`, `packages/**/CHANGELOG.md`], {
    stdio: `inherit`,
  })
  await execa(`git`, [`add`, ...updatedChangelogs])
  await execa(`git`, [`commit`, `-m`, commitMessage])
  try {
    await execa(`git`, [
      `remote`,
      `set-url`,
      `origin`,
      `https://gatsbybot:${process.env.GITHUB_BOT_AUTH_TOKEN}@github.com/gatsbyjs/gatsby.git`,
    ])
    await execa(`git`, [`push`, `-u`, `origin`, branch])
  } finally {
    // Reset the token to not store it on disk
    await execa(`git`, [
      `remote`,
      `set-url`,
      `origin`,
      `https://github.com/gatsbyjs/gatsby.git`,
    ])
  }

  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
  })

  const owner = `gatsbyjs`
  const repo = `gatsby`

  // Note: PR may already exist for this branch.
  // Then it will throw but we don't care too much
  const pr = await octokit.pulls.create({
    owner,
    repo,
    title: commitMessage,
    head: branch,
    base,
    body: `Updated changelogs of the following packages:\n\n${updatedPackages
      .map(p => `- ${p}`)
      .join(`\n`)}`,
  })

  console.log(`\n---\n\nPR opened - ${pr.data.html_url}`)

  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: [`type: maintenance`],
  })
}

run().catch(error => {
  const safeError = String(error)
    .split(process.env.GITHUB_BOT_AUTH_TOKEN)
    .join(`{process.env.GITHUB_BOT_AUTH_TOKEN}`)

  console.error(safeError)
  process.exit(1)
})
