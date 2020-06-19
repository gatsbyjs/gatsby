const log4js = require(`log4js`)
const shell = require(`shelljs`)
const { graphql: baseGraphql } = require(`@octokit/graphql`)
let logger = log4js.getLogger(`sync`)

require(`dotenv`).config()

const token = process.env.GITHUB_API_TOKEN
const host = `https://${token}@github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${host}/${owner}/${sourceRepo}`
const sourceRepoGitUrl = `${sourceRepoUrl}.git`
const syncLabelName = `sync`

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
    shell.exec(`git checkout master`)
    shell.exec(`git pull origin master`)
  }
}

// Run the query and exit if there are errors
async function graphql(query, params) {
  const graphqlWithAuth = baseGraphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  })
  try {
    return await graphqlWithAuth(query, params)
  } catch (error) {
    logger.error(error.message)
    return process.exit(1)
  }
}

async function getRepository(owner, name) {
  const { repository } = await graphql(
    `
      query($owner: String!, $name: String!, $syncLabel: String!) {
        repository(owner: $owner, name: $name) {
          id
          syncPullRequests: pullRequests(labels: [$syncLabel], first: 1) {
            nodes {
              id
            }
          }
          syncLabel: label(name: $syncLabel) {
            id
          }
        }
      }
    `,
    {
      owner,
      name,
      syncLabel: syncLabelName,
    }
  )
  return repository
}

async function createLabel(input) {
  const { createLabel } = await graphql(
    `
      mutation($input: CreateLabelInput!) {
        createLabel(input: $input) {
          label {
            id
          }
        }
      }
    `,
    {
      headers: {
        accept: `application/vnd.github.bane-preview+json`,
      },
      input,
    }
  )
  return createLabel.label
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
        accept: `application/vnd.github.shadow-cat-preview+json`,
      },
      input,
    }
  )
  return createPullRequest.pullRequest
}

async function addLabelToPullRequest(pullRequest, label) {
  await graphql(
    `
      mutation($input: AddLabelsToLabelableInput!) {
        addLabelsToLabelable(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      headers: {
        accept: `application/vnd.github.bane-preview+json`,
      },
      input: {
        labelableId: pullRequest.id,
        labelIds: [label.id],
      },
    }
  )
}

function conflictPRBody(conflictFiles, comparisonUrl, prNumber) {
  return `
Sync conflicts with the source repo. Please update the translations based on updated source content.

For more information on how to resolve sync conflicts, check out the [guide for syncing translations](https://gatsbyjs.org/contributing/translation/sync-guide/).

<details ${conflictFiles.length <= 10 ? `open` : ``}>
<summary>The following ${
    conflictFiles.length
  } files have conflicts:</summary><br />

${conflictFiles.map(file => `* [ ] ${file}`).join(`\n`)}
</details>

Once all the commits have been fixed, mark this pull request as "Ready for review" and merge it in!

See all changes since the last sync here:

${comparisonUrl}

NOTE: Do **NOT** squash-merge this pull request. The sync script requires a ref to the source repo in order to work correctly.

## Related PRs

#${prNumber} PR for syncing non-conflicting files
  `
}

function syncPRBody() {
  return `
Sync all non-conflicting files with the source repo. This PR contains all updates that do not cause any conflicts and can be merged immediately.

NOTE: Do *NOT* squash-merge this pull request. The sync script requires a ref to the source repo in order to work correctly.
  `
}

async function syncTranslationRepo(code) {
  logger = log4js.getLogger(`sync:` + code)
  logger.level = `info`
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

  const repository = await getRepository(owner, transRepoName)

  if (repository.syncPullRequests.nodes.length > 0) {
    logger.info(
      `There are currently open sync pull requests. Please ask the language maintainers to merge the existing PR(s) in before opening another one. Exiting...`
    )
    process.exit(0)
  }

  logger.info(`No currently open sync pull requests.`)

  let syncLabel
  if (!repository.syncLabel) {
    logger.info(
      `Repository does not have a "${syncLabelName}" label. Creating one...`
    )
    syncLabel = await createLabel({
      repositoryId: repository.id,
      name: syncLabelName,
      description: `Sync with translation source. Used by @gatsbybot to track open sync pull requests.`,
      color: `fbca04`,
    })
  } else {
    logger.info(`Repository has an existing ${syncLabelName} label.`)
    syncLabel = repository.syncLabel
  }

  // TODO exit early if this fails
  // Compare these changes
  const baseHash = shell
    .exec(`git merge-base origin/master source/master`, { silent: true })
    .stdout.replace(`\n`, ``)
  const shortBaseHash = getShortHash(baseHash)

  const hash = shell
    .exec(`git rev-parse source/master`, { silent: true })
    .stdout.replace(`\n`, ``)
  const shortHash = getShortHash(hash)

  logger.info(`Syncing with source (no conflicts)...`)
  const syncBranch = `sync-${shortHash}`
  if (shell.exec(`git checkout ${syncBranch}`, { silent: true }).code !== 0) {
    shell.exec(`git checkout -b ${syncBranch}`)
  }
  shell.exec(`git pull source master --no-edit --strategy-option ours`, {
    silent: true,
  })

  // Remove files that are deleted by upstream
  // https://stackoverflow.com/a/54232519
  shell.exec(`git diff --name-only --diff-filter=U | xargs git rm`)
  shell.exec(`git commit --no-edit`)

  shell.exec(`git push -u origin ${syncBranch}`)

  logger.info(`Creating sync pull request`)
  // TODO if there is already an existing PR, don't create a new one and exit early
  const syncPR = await createPullRequest({
    repositoryId: repository.id,
    baseRefName: `master`,
    headRefName: syncBranch,
    title: `(sync) Sync with ${sourceRepo} @ ${shortHash}`,
    body: syncPRBody(),
    maintainerCanModify: true,
  })
  await addLabelToPullRequest(syncPR, syncLabel)

  // if we successfully publish the PR, pull again and create a new PR --
  shell.exec(`git checkout master`)

  const comparisonUrl = `${sourceRepoUrl}/compare/${shortBaseHash}..${shortHash}`

  // Check out a new branch
  logger.info(`Finding conflicts with source...`)
  const conflictBranch = `conflicts-${shortHash}`
  if (
    shell.exec(`git checkout ${conflictBranch}`, { silent: true }).code !== 0
  ) {
    shell.exec(`git checkout -b ${conflictBranch}`)
  }

  // pull from the source
  const output = shell.exec(`git pull source master`, { silent: true }).stdout
  if (output.includes(`Already up to date.`)) {
    logger.info(`We are already up to date with source.`)
    process.exit(0)
  }
  const lines = output.split(`\n`)

  // find all merge conflicts
  const conflictLines = lines.filter(line =>
    line.startsWith(`CONFLICT (content)`)
  )

  // If no conflicts, exit early
  if (conflictLines.length === 0) {
    logger.info(`No conflicting files found. Exiting...`)
    process.exit(0)
  }

  // Message is of the form:
  // CONFLICT (content): Merge conflict in {file path}
  const conflictFiles = conflictLines.map(line =>
    line.substr(line.lastIndexOf(` `) + 1)
  )
  // Do a soft reset and unstage non-conflicted files
  shell.exec(`git reset`, { silent: true })

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
  if (removedFiles.length > 0) {
    shell.exec(`git rm ${removedFiles.join(` `)}`, { silent: true })
  }

  // clean out the rest of the changed files
  shell.exec(`git checkout -- .`)
  shell.exec(`git clean -fd`, { silent: true })

  // Commit the conflicts into the new branch and push it
  shell.exec(`git commit -m "Commit git conflicts"`, { silent: true })
  shell.exec(`git push -u origin ${conflictBranch}`)

  logger.info(`Creating conflicts pull request`)
  // TODO assign codeowners as reviewers
  const conflictsPR = await createPullRequest({
    repositoryId: repository.id,
    baseRefName: `master`,
    headRefName: conflictBranch,
    title: `(sync) Resolve conflicts with ${sourceRepo} @ ${shortHash}`,
    body: conflictPRBody(conflictFiles, comparisonUrl, syncPR.number),
    maintainerCanModify: true,
    draft: true,
  })
  await addLabelToPullRequest(conflictsPR, syncLabel)
}

const [langCode] = process.argv.slice(2)
syncTranslationRepo(langCode)
