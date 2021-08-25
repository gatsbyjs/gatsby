const execa = require(`execa`)
const { getAllPackageNames, updateChangelog } = require(`./generate`)

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN env var not set`)
}

async function run() {
  await execa(`git`, [`pull`])

  // Always commit to the same branch
  const branchName = `bot-changelog-update`
  try {
    await execa(`git`, [`checkout`, `-b`, branchName])
  } catch(e) {
    await execa(`git`, [`checkout`, branchName])
  }

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
  await execa(`git`, [`commit`, `-m`, commitMessage])
  await execa(`git`, [`push`, `origin`, `${branchName}:${branchName}`])

  const octokit = new Octokit({
    auth: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
  })

  const pr = await octokit.pulls.create({
    owner: `gatsby`,
    repo: `gatsbyjs`,
    title: commitMessage,
    head: branchName,
    base: `vladar/generate-changelogs`,
    body: `Update changelogs of the following packages:\n\n${updatedPackages
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
