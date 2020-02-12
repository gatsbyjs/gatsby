const log4js = require(`log4js`)
const shell = require(`shelljs`)
const { graphql } = require(`@octokit/graphql`)
let logger = log4js.getLogger(`sync`)

require(`dotenv`).config()

const host = `https://github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${host}/${owner}/${sourceRepo}`
const sourceRepoGitUrl = `${sourceRepoUrl}.git`

// get the git short hash
function getShortHash(hash) {
  return hash.substr(0, 7)
}

function cloneOrUpdateRepo(repoName, repoUrl) {
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`cloning ${repoName}`)
    shell.exec(`git clone ${repoUrl}`)
    shell.cd(repoName)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git pull origin master`)
  }
}

async function getRepository(owner, name) {
  const { repository } = await graphql(
    `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_ADMIN_AUTH_TOKEN}`,
      },
      owner,
      name,
    }
  )
  return repository
}
async function createPullRequest(input) {
  const { createPullRequest } = await graphql(
    `
      mutation($input: CreatePullRequestInput!) {
        createPullRequest(input: $input) {
          pullRequest {
            id
            number
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
        accept: `application/vnd.github.shadow-cat-preview+json`,
      },
      input,
    }
  )
  return createPullRequest
}

function conflictPRBody(conflictFiles, comparisonUrl) {
  return `
Sync conflicts with the source repo. Please update the translations based on updated source content.

<details ${conflictFiles.length <= 10 ? `open` : ``}>
<summary>The following ${
    conflictFiles.length
  } files have conflicts:</summary><br />

${conflictFiles.map(file => `* [ ] ${file}`).join(`\n`)}
</details>

Once all the commits have been fixed, mark this pull request as "Ready for review" and merge it in!

See all changes since the last sync here:

${comparisonUrl}

NOTE: Do *NOT* squash-merge this pull request. The sync script requires a ref to the source repo in order to work correctly.
  `
}

function syncPRBody(conflictPRNumber) {
  return `
Sync all non-conflicting files with the source repo.
This PR contains all updates that do not cause any conflicts and can be merged immediately.

Pull Request #${conflictPRNumber} was created to resolve conflicts during merge.
Please resolve the conflicts in that PR and merge it in as well.

NOTE: Do *NOT* squash-merge this pull request. The sync script requires a ref to the source repo in order to work correctly.
  `
}

async function syncTranslationRepo(code) {
  logger = log4js.getLogger(`sync:` + code)
  const transRepoName = `${repoBase}-${code}`
  const transRepoUrl = `${host}/${owner}/${transRepoName}`
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }
  cloneOrUpdateRepo(transRepoName, transRepoUrl)

  shell.exec(`git remote add source ${sourceRepoGitUrl}`)
  shell.exec(`git fetch source master`)

  // TODO don't run the sync script if there is a current PR from the bot

  // TODO exit early if this fails
  // Compare these changes
  const baseHash = shell
    .exec(`git merge-base origin/master source/master`)
    .stdout.replace(`\n`, ``)
  const shortBaseHash = getShortHash(baseHash)

  const hash = shell
    .exec(`git rev-parse source/master`)
    .stdout.replace(`\n`, ``)
  const shortHash = getShortHash(hash)

  const comparisonUrl = `${sourceRepoUrl}/compare/${shortBaseHash}..${shortHash}`

  // Check out a new branch
  const conflictBranch = `conflicts-${shortHash}`
  if (shell.exec(`git checkout ${conflictBranch}`).code !== 0) {
    shell.exec(`git checkout -b ${conflictBranch}`)
  }

  // pull from the source
  const output = shell.exec(`git pull source master`).stdout
  if (output.includes(`Already up to date.`)) {
    logger.info(`We are already up to date with source.`)
    process.exit(0)
  }
  const lines = output.split(`\n`)

  // find all merge conflicts
  // FIXME deal with deleted file conflicts
  const conflictLines = lines.filter(line =>
    line.startsWith(`CONFLICT (content)`)
  )
  // Message is of the form:
  // CONFLICT (content): Merge conflict in {file path}
  const conflictFiles = conflictLines.map(line =>
    line.substr(line.lastIndexOf(` `) + 1)
  )
  // Do a soft reset and unstage non-conflicted files
  shell.exec(`git reset`)

  // Add all the conflicts as-is
  shell.exec(`git add ${conflictFiles.join(` `)}`)

  const removedLines = lines.filter(line =>
    line.startsWith(`CONFLICT (modify/delete)`)
  )
  // Deleted message format:
  // CONFLICT (modify/delete): {file path} deleted in {hash} and modified in HEAD. Version HEAD of {file path} left in tree.
  const removedFiles = removedLines.map(
    line => line.replace(`CONFLICT (modify/delete): `, ``).split(` `)[0]
  )
  shell.exec(`git rm ${removedFiles.join(` `)}`)

  // If no conflicts, merge directly into master
  // TODO handle committing removed files
  // TODO does gatsby-bot have merge permissions?
  // if (conflictFiles.length === 0) {
  //   logger.info(`No conflicts found. Committing directly to master.`)
  //   shell.exec(`git checkout master`)
  //   shell.exec(`git merge ${conflictBranch}`)
  //   shell.exec(`git push origin master`)
  //   process.exit(0)
  // }

  // clean out the rest of the changed files
  shell.exec(`git checkout -- .`)
  shell.exec(`git clean -fd`)

  // Commit the conflicts into the new branch and push it
  shell.exec(`git commit -m "Commit git conflicts"`)
  shell.exec(`git push -u origin ${conflictBranch}`)

  // TODO if there is already an existing PR, don't create a new one

  const repository = await getRepository(owner, transRepoName)

  const { number } = await createPullRequest({
    repositoryId: repository.id,
    baseRefName: `master`,
    headRefName: conflictBranch,
    title: `(sync) Resolve conflicts with ${sourceRepo} @ ${shortHash}`,
    body: conflictPRBody(conflictFiles, comparisonUrl),
    maintainerCanModify: true,
    draft: true,
  })

  // if we successfully publish the PR, pull again and create a new PR --
  // this time taking *only* the non-conflicting files
  shell.exec(`git checkout master`)

  const syncBranch = `sync-${shortHash}`
  if (shell.exec(`git checkout ${syncBranch}`).code !== 0) {
    shell.exec(`git checkout -b ${syncBranch}`)
  }
  shell.exec(`git pull source master --no-edit --strategy-option ours`)
  shell.exec(`git push -u origin ${syncBranch}`)

  await createPullRequest({
    repositoryId: repository.id,
    baseRefName: `master`,
    headRefName: syncBranch,
    title: `(sync) Sync with ${sourceRepo} @ ${shortHash}`,
    body: syncPRBody(number),
    maintainerCanModify: true,
  })
  // shell.exec(`git push origin master`)
}

const [langCode] = process.argv.slice(2)
syncTranslationRepo(langCode)
