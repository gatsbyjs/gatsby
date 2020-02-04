const fs = require(`fs`)
const fetch = require(`node-fetch`)
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

function getLineNumber(filePath) {
  const contents = fs.readFileSync(filePath, `utf-8`).split(`\n`)
  return contents.findIndex(line => line.includes(`<<<<<<<`))
}

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

// TODO make this more robust
async function getFileHashes(comparisonUrl) {
  const response = await fetch(comparisonUrl)
  const text = await response.text()
  const regex = /<a href="(#diff-[a-f0-9]+)">(.+)<\/a>/g
  const result = {}
  let match
  while ((match = regex.exec(text)) !== null) {
    const [, href, filename] = match
    result[filename] = href
  }
  return result
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

  // Compare these changes
  const baseHash = shell
    .exec(`git merge-base origin/master source/master`)
    .stdout.replace(`\n`, ``)
  const shortBaseHash = getShortHash(baseHash)

  shell.exec(`git fetch source master`)
  const hash = shell.exec(`git rev-parse source/master`).stdout
  const shortHash = getShortHash(hash)

  const comparisonUrl = `${sourceRepoUrl}/compare/${shortBaseHash}..${shortHash}`

  // Check out a new branch
  const syncBranch = `sync-${shortHash}`
  if (shell.exec(`git checkout ${syncBranch}`).code !== 0) {
    shell.exec(`git checkout -b ${syncBranch}`)
  }

  // pull from the source
  shell.exec(`git remote add source ${sourceRepoGitUrl}`)
  const output = shell.exec(`git pull source master`).stdout
  if (output.includes(`Already up to date.`)) {
    logger.info(`We are already up to date with source.`)
    process.exit(0)
  }
  const lines = output.split(`\n`)

  // // find all merge conflicts
  const conflictLines = lines.filter(line => line.startsWith(`CONFLICT`))
  const conflictFiles = conflictLines.map(line =>
    line.substr(line.lastIndexOf(` `) + 1)
  )
  const lineNumbers = {}
  for (let file of conflictFiles) {
    lineNumbers[file] = getLineNumber(file)
  }
  // shell.exec(`git reset --hard`)

  // If no conflicts, merge directly into master
  // TODO does gatsby-bot have merge permissions?
  // if (conflictFiles.length === 0) {
  //   logger.info(`No conflicts found. Committing directly to master.`)
  //   shell.exec(`git checkout master`)
  //   shell.exec(`git merge ${syncBranch}`)
  //   shell.exec(`git push origin master`)
  //   process.exit(0)
  // }

  // Do a soft reset and add the conflict files as-is
  // shell.exec(`git reset`)
  shell.exec(`git add ${conflictFiles.join(` `)}`)
  // // clean out the rest of the changed files
  // shell.exec(`git checkout -- .`)
  // shell.exec(`git clean -fd`)

  // Commit the conflicts into the new branch and push it
  shell.exec(`git commit -m "Commit git conflicts"`)
  shell.exec(`git push -u origin ${syncBranch}`)

  // TODO if there is already an existing PR, don't create a new one

  const repository = await getRepository(owner, transRepoName)

  const body = `
Sync with the source repo. Please update the translations based on updated source content.

<details ${conflictFiles.length <= 10 ? `open` : ``}>
<summary>The following ${
    conflictFiles.length
  } files have conflicts:</summary><br />

${conflictFiles.map(file => `* ${file}`).join(`\n`)}
</details>

Once all the commits have been fixed, mark this pull request as "Ready for review" and merge it in!

Refer to the comments made by @gatsbybot or see all changes since the last sync here:

${comparisonUrl}
  `

  // create a new draft PR
  const {
    createPullRequest: { pullRequest },
  } = await graphql(
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
        baseRefName: `master`,
        headRefName: syncBranch,
        title: `Sync with ${sourceRepo} @ ${shortHash}`,
        body,
        maintainerCanModify: true,
        draft: true,
      },
    }
  )
  const hashes = await getFileHashes(comparisonUrl)

  const threads = conflictFiles.map(file => {
    const hash = hashes[file]
    const body = `
Compare changes for this file:

${comparisonUrl}${hash}
    `
    return {
      path: file,
      body,
      line: lineNumbers[file],
      side: `RIGHT`,
    }
  })

  // publish the review
  // for each file, link to the changes in the English version for that file
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
        accept: `application/vnd.github.comfort-fade-preview+json`,
      },
      input: {
        pullRequestId: pullRequest.id,
        event: `COMMENT`,
        threads,
      },
    }
  )

  // if we successfully publish the PR
  // pull again, taking the translated version and push to master
  // shell.exec(`git reset --hard`)
  // shell.exec(`git checkout master`)
  // shell.exec(`git pull source master --strategy-option ours`)
  // shell.exec(`git push origin master`)
}

const [langCode] = process.argv.slice(2)
syncTranslationRepo(langCode)
