require(`dotenv`).config()

const yargs = require(`yargs`)
const { Octokit } = require(`@octokit/rest`)
const childProcess = require(`child_process`)

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN env var not set`)
}

// Tip: Use the token from GatsbyBot (inside 1Password)
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
})

const argv = yargs
  .command(
    `* <release> [pr]`,
    `Backports merged PR into release branch and open Cherry PR`,
    commandBuilder =>
      commandBuilder
        .positional(`release`, { type: `string` })
        .positional(`pr`, { type: `number` })
  )
  .check(argv => {
    if (!/^3\.\d+$/.test(argv.release)) {
      throw new Error(`"${argv.release}" is not a release version`)
    }

    if (!argv.pr) {
      throw new Error(`PR number is required`)
    }

    return true
  }).argv

const repo = `gatsby`
const owner = `gatsbyjs`

// no try/catches - if it fails at any point - let it fail and just do stuff manually ;)
// this is just for happy path - if there is extra work needed - this script won't be able to do it
async function run() {
  const result = await octokit.pulls.get({
    owner,
    repo,
    pull_number: argv.pr,
  })

  if (!result.data.merged_at) {
    throw new Error(`That pull request was not merged`)
  }

  const commitsha = result.data.merge_commit_sha

  const commitMeta = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: commitsha,
  })

  // get first line
  const commitMessage = commitMeta.data.message.split(`\n`)[0]

  if (!commitsha) {
    throw new Error(`Can't get merge commit sha`)
  }

  const releaseBranchName = `release/${argv.release}`
  const backportReleaseBranchName = `backport-${argv.release}-${argv.pr}`

  childProcess.execSync(`git fetch origin release/${argv.release}`, {
    stdio: `inherit`,
  })

  try {
    childProcess.execSync(`git branch -D "${backportReleaseBranchName}"`, {
      stdio: `inherit`,
    })
    // eslint-disable-next-line no-empty
  } catch {}

  childProcess.execSync(
    `git checkout -b "${backportReleaseBranchName}" "origin/${releaseBranchName}" --no-track`,
    {
      stdio: `inherit`,
    }
  )

  childProcess.execSync(`git cherry-pick -x ${commitsha}`, {
    stdio: `inherit`,
  })

  childProcess.execSync(`git push origin +${backportReleaseBranchName}`, {
    stdio: `inherit`,
  })

  const pr = await octokit.pulls.create({
    owner,
    repo,
    title: commitMessage,
    head: backportReleaseBranchName,
    base: releaseBranchName,
    body: `Backporting #${argv.pr} to the ${argv.release} release branch\n\n(cherry picked from commit ${commitsha})`,
  })

  console.log(`\n---\n\nPR opened - ${pr.data.html_url}`)

  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: [`type: cherry`],
  })

  return result
}

run()
