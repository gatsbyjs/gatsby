const log4js = require(`log4js`)
const shell = require(`shelljs`)
const { graphql } = require(`@octokit/graphql`)
let logger = log4js.getLogger(`sync`)

const host = `https://github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${host}/${owner}/${sourceRepo}.git`

function getDiffChunks(diff) {
  // TODO
}

function cloneOrUpdateRepo(repoName, repoUrl) {
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`cloning ${repoName}`)
    shell.exec(`git clone ${repoUrl}`)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git pull origin master`)
    shell.cd(`..`)
  }
}

async function syncTranslationRepo(code) {
  logger = log4js.getLogger("sync:" + code)
  const transRepoName = `${repoBase}-${code}`
  const transRepoUrl = `${host}/${owner}/${transRepoName}`
  cloneOrUpdateRepo(transRepoName, transRepoUrl)
  shell.cd(transRepoName)

  // Check out a new branch
  shell.exec(`git fetch source master`)
  const hash = shell.exec(`git rev-parse source/master`).stdout
  const shortHash = hash.substr(0, 8)
  const syncBranch = `sync-${shortHash}`

  if (shell.exec(`git checkout ${syncBranch}`).code !== 0) {
    shell.exec(`git checkout -b ${syncBranch}`)
  }

  // pull from the source
  shell.exec(`git remote add source ${sourceRepoUrl}`)
  const output = shell.exec(`git pull source master`).stdout
  if (output.includes(`Already up to date.`)) {
    logger.info(`We are already up to date with source.`)
    process.exit(0)
  }
  const lines = output.split(`\n`)

  // find all merge conflicts
  const conflictLines = lines.filter(line => line.startsWith(`CONFLICT`))
  const conflictFiles = conflictLines.map(line =>
    line.substr(line.lastIndexOf(` `) + 1)
  )

  // If no conflicts, merge directly into master
  // TODO does gatsby-bot have merge permissions?
  if (conflictFiles.length === 0) {
    logger.info(`No conflicts found. Committing directly to master.`)
    shell.exec(`git checkout master`)
    shell.exec(`git merge ${syncBranch}`)
    shell.exec(`git push origin master`)
    process.exit(0)
  }

  // reset and pull again, this time taking the source version of updated files
  shell.exec(`git reset --hard`)
  shell.exec(`git pull source master --strategy-option theirs`)
  shell.exec(`git push --set-upstream origin ${syncBranch}`)

  // TODO if there is already an existing PR, don't create a new one

  // get the repository
  const { repository } = await graphql(
    `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `,
    {
      owner,
      name: transRepoName,
    }
  )

  // create a new draft PR
  const pullRequest = await graphql(
    `
      mutation($input: CreatePullRequestInput!) {
        createPullRequest(input: $input) {
          pullRequest {
            id
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
        accept: `application/vnd.github.shadow-cat-preview+json`,
      },
      input: {
        repositoryId: repository.id,
        baseRefName: "master",
        headRefName: syncBranch,
        title: `Sync with gatsby-i18n-source@${shortHash}`,
        body: ``,
        maintainerCanModify: true,
        draft: true,
      },
    }
  )

  // diff conflicting files against source/master on last sync
  const baseHash = shell.exec(`git merge-base origin/master source/master`)
    .stdout
  shell.exec(`git checkout source/master`)
  // TODO only do this for conflict files
  const diff = shell.exec(`git diff ${baseHash}`).stdout
  const chunks = getDiffChunks(diff)

  const comments = chunks.map(chunk => ({
    path: chunk.path,
    startLine: chunk.startLine,
    line: chunk.endsLine,
    // TODO suggest change to old version
    body: `
Change in source repo:

\`\`\`diff
- ${chunk.old}
+ ${chunk.new}
\`\`\`
    `,
  }))

  // publish the review
  // for each diff block, create a comment detailing the difference in the english version
  // and a template for suggesting the translated version
  await graphql(
    `
      mutation($input: AddPullRequestReviewInput!) {
        addPullRequestReview(input: $input) {
          clientMutationId
        }
      }
    `,
    {
      headers: {
        authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
      },
      input: {
        pullRequestId: pullRequest.id,
        event: "REQUEST_CHANGES",
        threads,
      },
    }
  )
}

syncTranslationRepo()
