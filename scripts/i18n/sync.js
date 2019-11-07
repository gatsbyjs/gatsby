const fs = require(`fs`)
const log4js = require(`log4js`)
const shell = require(`shelljs`)
const parseDiff = require(`parse-diff`)
const { graphql } = require(`@octokit/graphql`)
let logger = log4js.getLogger(`sync`)

const host = `https://github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`
// Repo to be used as basis for translations
const sourceRepo = `gatsby-i18n-source`

const sourceRepoUrl = `${host}/${owner}/${sourceRepo}.git`

const changeMarker = `?`
function resolveConflicts(filePath) {
  const contents = fs.readFileSync(filePath, `utf-8`).split(`\n`)
  const newContents = []

  let state = `normal`
  let hasDelLines = false

  for (let line of contents) {
    switch (state) {
      case `normal`:
        if (line.startsWith(`<<<<<<<`)) {
          state = `del`
          hasDelLines = false
        } else {
          newContents.push(line)
        }
        break
      case `del`:
        if (line.startsWith(`=======`)) {
          state = `add`
        } else {
          newContents.push(!line.trim() ? line : `${changeMarker} ${line}`)
          hasDelLines = true
        }
        break
      case `add`:
        if (line.startsWith(`>>>>>>>`)) {
          // If there were no deleted lines in the conflict, add a temp line
          if (!hasDelLines) {
            newContents.push(`${changeMarker} <NEW CONTENT>`)
          }
          state = `normal`
        }
        break
    }
  }
  fs.writeFileSync(filePath, newContents.join(`\n`))
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

// Get the actual endpoints of deleted content in the parse-diff chunk
// FIXME this fails sometimes -- figure out why
function getEndpoints(chunk) {
  let startLine = -1
  let endLine = -1

  // TODO there's prooobably a more elegant way to do this
  for (let change of chunk.changes) {
    if (change.type === `normal`) continue
    else if (change.type === `del`) {
      if (startLine === -1) {
        startLine = endLine = change.ln
      } else {
        endLine++
      }
    } else {
      // If there were no deleted lines, set both endpoints to the first added line
      if (startLine === -1) {
        startLine = endsLine = change.ln
      }
      break
    }
  }

  return { startLine, endLine }
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
  // if (conflictFiles.length === 0) {
  //   logger.info(`No conflicts found. Committing directly to master.`)
  //   shell.exec(`git checkout master`)
  //   shell.exec(`git merge ${syncBranch}`)
  //   shell.exec(`git push origin master`)
  //   process.exit(0)
  // }

  // Resolve the conflicts by choosing the translated version but adding a marker
  conflictFiles.forEach(file => {
    resolveConflicts(file)
  })

  // Do a soft reset and add the resolved conflict files
  shell.exec(`git reset`)
  shell.exec(`git add ${conflictFiles.join(` `)}`)
  // clean out the rest of the changed files
  shell.exec(`git checkout -- .`)
  shell.exec(`git clean -fd`)

  // Commit the resolved conflicts into a new branch
  // and push it
  shell.exec(`git commit -m "Annotate content with new translations"`)
  // shell.exec(`git push -u origin ${syncBranch}`)

  // TODO if there is already an existing PR, don't create a new one

  // get the repository
  const repository = await getRepository(owner, transRepoName)
  // diff conflicting files against source/master on last sync
  const baseHash = shell
    .exec(`git merge-base origin/master source/master`)
    .stdout.replace(`\n`, ``)
  shell.exec(`git checkout source/master`)
  const cmd = `git diff ${baseHash} ${conflictFiles.join(` `)}`
  const diff = shell.exec(cmd).stdout
  const diffFiles = parseDiff(diff)

  // shell.exec(`git reset --hard`)

  // create a new draft PR
  //   const {
  //     createPullRequest: { pullRequest },
  //   } = await graphql(
  //     `
  //       mutation($input: CreatePullRequestInput!) {
  //         createPullRequest(input: $input) {
  //           pullRequest {
  //             id
  //           }
  //         }
  //       }
  //     `,
  //     {
  //       headers: {
  //         authorization: `token ${process.env.GITHUB_BOT_AUTH_TOKEN}`,
  //         accept: `application/vnd.github.shadow-cat-preview+json`,
  //       },
  //       input: {
  //         repositoryId: repository.id,
  //         baseRefName: `master`,
  //         headRefName: syncBranch,
  //         title: `Sync with ${sourceRepo} @ ${shortHash}`,
  //         body: `
  // Sync with the source repo. Please update the translations based on updated source content.`,
  //         maintainerCanModify: true,
  //         draft: true,
  //       },
  //     }
  //   )

  const threads = []

  diffFiles.forEach(file => {
    file.chunks.forEach(chunk => {
      const endpoints = getEndpoints(chunk)
      const lines = chunk.changes.map(change => change.content).join(`\n`)
      const body = `
\`\`\`diff
${lines}
\`\`\`
`
      threads.push({
        path: file.to,
        body,
        startLine: endpoints.startLine,
        startSide: "RIGHT",
        line: endpoints.endLine,
        side: "RIGHT",
      })
    })
  })

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
        accept: "application/vnd.github.comfort-fade-preview+json",
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
  // shell.exec(`git checkout master`)
  // shell.exec(`git pull source master --strategy-option ours`)
  // shell.exec(`git push origin master`)
}

const [langCode] = process.argv.slice(2)
syncTranslationRepo(langCode)
