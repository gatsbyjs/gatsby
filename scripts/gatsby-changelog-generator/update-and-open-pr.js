const execa = require(`execa`)
const { getAllPackageNames, updateChangelog } = require(`./generate`)

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN env var not set`)
}

async function run() {
  await execa(`git`, [`checkout`, `master`])
  await execa(`git`, [`pull`, `--tags`])

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

  // Commit to the same branch
  const branchName = `bot-changelog-update`
  const commitMessage = `DO NOT MERGE: testing`
  try {
    await execa(`git`, [`checkout`, `-b`, branchName, `origin/${branchName}`])
  } catch {
    await execa(`git`, [`checkout`, branchName])
  }
  await execa(`git`, [`commit`, `-m`, commitMessage])

  try {
    const pr = await octokit.pulls.create({
      owner: `gatsby`,
      repo: `gatsbyjs`,
      title: commitMessage,
      head: branchName,
      base: `master`,
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
  } catch (e) {
    console.log(e)
  }
}
