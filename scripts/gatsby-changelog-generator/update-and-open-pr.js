const execa = require(`execa`)
const { Octokit } = require(`@octokit/rest`)
const { getAllPackageNames, updateChangelog } = require(`./generate`)

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN env var not set`)
}

async function run() {
  // Always use the same branch
  const base = `vladar/generate-changelogs`
  const branchName = `bot-changelog-update`

  try {
    await execa(`git`, [`branch`, `-D`, branchName])
    // eslint-disable-next-line no-empty
  } catch (e) {}

  await execa(`git`, [`fetch`, `--tags`, `origin`])

  try {
    // Try to create a branch from the existing remote as a starting point
    await execa(`git`, [`checkout`, `-B`, branchName, `origin/${branchName}`])
  } catch (e) {
    await execa(`git`, [`checkout`, `-b`, branchName])
  }
  await execa(`git`, [`merge`, `origin/${base}`])

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

  const commitMessage = `DO NOT MERGE: testing`
  const updatedChangelogs = updatedPackages.map(
    pkg => `packages/${pkg}/CHANGELOG.md`
  )
  await execa(`git`, [`add`, ...updatedChangelogs])
  await execa(`git`, [`commit`, `-m`, commitMessage])
  await execa(`git`, [`push`, `-u`, `origin`, branchName])

  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
  })

  try {
    const owner = `gatsbyjs`
    const repo = `gatsby`

    // Note: PR may already exist for this branch.
    // Then it will throw but we don't care too much
    const pr = await octokit.pulls.create({
      owner,
      repo,
      title: commitMessage,
      head: branchName,
      base: base,
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
  } catch (e) {
    console.error(e)
  }
}

run()
