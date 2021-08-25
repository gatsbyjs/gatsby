const execa = require(`execa`)
const { Octokit } = require(`@octokit/rest`)
const { getAllPackageNames, updateChangelog } = require(`./generate`)

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN env var not set`)
}

async function run() {
  // Always use the same branch
  const branchName = `bot-changelog-update`

  try {
    await execa(`git`, [`branch`, `-D`, branchName])
    // eslint-disable-next-line no-empty
  } catch {}

  await execa(`git`, [`fetch`, `--tags`, `origin`])
  try {
    await execa(`git`, [`checkout`, `-b`, branchName])
  } catch (e) {
    await execa(`git`, [`checkout`, branchName])
  }

  const updatedchangelogs = []
  for (const pkg of getAllPackageNames()) {
    try {
      const updated = await updateChangelog(pkg)
      if (updated) {
        updatedchangelogs.push(`packages/${pkg}/CHANGELOG.md`)
      }
    } catch (e) {
      console.error(`${pkg}: ${e.stack}`)
    }
  }

  if (!updatedchangelogs.length) {
    console.log(`Nothing to do`)
    return
  }

  const commitMessage = `DO NOT MERGE: testing`
  await execa(`git`, [`add`, ...updatedchangelogs])
  await execa(`git`, [`commit`, `-m`, commitMessage])
  await execa(`git`, [`push`, `origin`, `${branchName}:${branchName}`])

  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
  })

  const owner = `gatsbyjs`
  const repo = `gatsby`

  const pr = await octokit.pulls.create({
    owner,
    repo,
    title: commitMessage,
    head: branchName,
    base: `vladar/generate-changelogs`,
    body: `Updated following changelogs:\n\n${updatedchangelogs
      .map(p => `- ${p}`)
      .join(`\n`)}`,
  })

  console.log(`\n---\n\nPR opened - ${pr.data.html_url}`)

  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: [`bot: merge on green`],
  })
}

run().catch(console.error)
